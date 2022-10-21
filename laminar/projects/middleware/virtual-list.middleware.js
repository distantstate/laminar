function createResizeObserver({ state }) {
  return new ResizeObserver(entries => {
    const entry = entries[0];
    const index = parseInt(entry.target.dataset[`${state.id}I`]);

    entries.forEach(entry => {
      if (state.items[index].height !== entry.borderBoxSize[0].blockSize) {
        state.items[index].height = entry.borderBoxSize[0].blockSize;

        for (let i = index + 1; i <= state.endAt; i++) {
          state.items[i].y = state.items[i - 1].y + state.items[i - 1].height;
          if (document.querySelector(`[data-${state.id}-i="${i}"]`))
          document.querySelector(`[data-${state.id}-i="${i}"]`).style.transform = `translateY(${state.items[i].y}px)`;
        }
      }
    });
  });
}

function createIntersectionObserver({ state, scrollDown, scrollUp, prependItems, appendItems }) {
  return new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio !== 0 && entry.intersectionRatio !== 1) return;

        const top = state.listElement.getBoundingClientRect().top;
        const scrollingDown = top < state.scrollPos;
        const scrollingUp = top > state.scrollPos;
        state.scrollPos = top;
  
        if (scrollDown && scrollingDown) scrollDown({ state, entry, appendItems });
        if (scrollUp && scrollingUp) scrollUp({ state, entry, prependItems });
      });
    },
    {
      root: state.containerElem,
      rootMargin: '0px',
      threshold: [0, 1],
    }
  );
}

function removeTopOverflow({ state }) {
  while (state.listElement.firstElementChild.getBoundingClientRect().bottom < state.containerElemTop - state.overflow) {
    state.intersectionObserver.unobserve(state.listElement.firstElementChild);
    state.resizeObserver.unobserve(state.listElement.firstElementChild);
    state.listElement.firstElementChild.remove();
    state.startAt += 1;
  }
}

function removeBottomOverflow({ state }) {
  while (state.listElement.lastElementChild.getBoundingClientRect().top > state.containerElemBottom + state.overflow) {
    state.intersectionObserver.unobserve(state.listElement.lastElementChild);
    state.resizeObserver.unobserve(state.listElement.lastElementChild);
    state.listElement.lastElementChild.remove();
    state.endAt -= 1;
  }
}

function scrollDown({ state, entry, appendItems }) {
  const next = entry.target.nextElementSibling;

  if (!next) return;

  removeTopOverflow({ state });
  appendItems({ state });
}

function scrollUp({ state, entry, prependItems }) {
  const previous = entry.target.previousElementSibling;

  if (!previous) return;

  removeBottomOverflow({ state });
  prependItems({ state });
}

function prependItems({ state }) {
  while (
    state.items[state.startAt - 1] &&
    (state.listElement.firstElementChild?.getBoundingClientRect().top || 0) > state.containerElemTop - state.overflow
  ) {
    state.startAt -= 1;
    insertItem({ state, item: state.items[state.startAt], index: state.startAt, append: false });
  }
}

function appendItems({ state }) {
  while (
    state.items[state.endAt + 1] &&
    (state.listElement.lastElementChild?.getBoundingClientRect().bottom || 0) <
      state.containerElemBottom + state.overflow
  ) {
    state.endAt += 1;
    insertItem({ state, item: state.items[state.endAt], index: state.endAt, append: true });
  }
}

function insertItem({ state, item, index, append = true }) {
  state.template.innerHTML = state.renderMethod(item.data, item.state, index);
  const element = state.template.content.firstElementChild;
  element.style.position = 'absolute';
  element.setAttribute(`data-${state.id}-i`, index);
  state.listElement[append ? 'append' : 'prepend'](state.template.content);
  state.items[index].y = state.items[index - 1] ? state.items[index - 1].y + state.items[index - 1].height : 0;
  item.height = item.height || element.getBoundingClientRect().height;
  element.style.transform = `translateY(${item.y}px)`;
  if (state.updateMethod) state.updateMethod(element)(item.data, item.state, item.i);
  state.listElement.style.height = `${item.y + item.height}px`;
  state.resizeObserver.observe(element);
  state.intersectionObserver.observe(element);
}

export const virtualListMiddleware = (...collections) => {
  const store = collections.reduce((acc, { id, renderMethod, updateMethod, data = [], overflow = 200 }) => {
    acc[id] = {
      id,
      template: document.createElement('template'),
      containerElem: undefined,
      listElement: undefined,
      containerElemHeight: undefined,
      containerElemTop: undefined,
      scontainerElemBottom: undefined,
      intersectionObserver: undefined,
      resizeObserver: undefined,
      renderMethod,
      updateMethod,
      startAt: 0,
      endAt: -1,
      overflow,
      scrollPos: 0,
      items: data.map((data) => ({
        data,
        state: {},
        height: 0,
        i: 0,
        y: 0,
      })),
    };

    return acc;
  }, {});

  window.getStore = () => store;

  return ctrl => next => directive => {
    if (!directive.list) return next(directive);

    const state = store[directive.list.id];

    if (directive.list.attach || directive.list.append || directive.list.update || directive.list.reset) {
      return next({
        fn: () => {

          if (directive.list.reset) {
            console.log('RESET');
            state.items = [];
            state.startAt = 0;
            state.endAt = -1;
          }

          if (directive.list.attach) {
            state.containerElem = document.querySelector(directive.list.attach);
            const { height, top, bottom } = state.containerElem.getBoundingClientRect();

            state.containerElemHeight = height;
            state.containerElemTop = top;
            state.containerElemBottom = bottom;
            state.scrollPos = 0;
            state.resizeObserver = createResizeObserver({ state });
            state.intersectionObserver = createIntersectionObserver({
              state,
              scrollDown,
              scrollUp,
              prependItems,
              appendItems,
            });
            state.listElement = document.createElement('ul');
            state.containerElem.append(state.listElement);
          }

          if (directive.list.append) {
            directive.list.append.forEach((item, i) => {
              state.items.push({
                data: item,
                state: {},
                height: 0,
                i,
                y: 0,
              });
            });
          }

          if (directive.list.refresh) {
            appendItems({ state });
          }
        },
        ...directive,
      });
    }

    if (directive.list.update) {
      return next({
        fn: () => {
          const index = state.items.findIndex((item) => item.data[directive.key || 'id'] === directive.list.value);
          state.items[index].data = directive.list.update;
          const elem = document.querySelector(`[data-${state.id}-i="${index}"]`);
          if (state.updateMethod && elem) state.updateMethod(elem)(state.items[index].data, state.items[index].state, index);
        },
        ...directive,
      });
    }
  };
};
