import { createController } from "../../../laminar/src/create-controller.js";

// regex:  new RegExp(/^\s*\/\/.*/, 'g'),
// filters: 'grayscale(1) brightness(0.6)'

const filters = [
  {
    regex:  new RegExp(/^\s*\/\/.*/, 'g'),
    filters: 'grayscale(1) brightness(0.6)'
  },
  {
    regex:  new RegExp(/\.\w+/, 'g'),
    filters: 'hue-rotate(266deg)'
  },
  {
    regex: new RegExp(`\\.\\.\\.|".*"|'.*'`, "g"),
    filters: "hue-rotate(73deg)",
  },
  {
    regex: new RegExp("import|export", "g"),
    filters: "hue-rotate(90deg)",
  },
  {
    regex: new RegExp("const|let|var|return|if|for|=>|\[|\]", "g"),
    filters: "hue-rotate(115deg)",
  },
];

export const colorizeCodeMiddleware = (ctrl) => (next) => (directive) => {
  if (directive.colorize) {
    return next({
      ...directive,
      fn: async () => {
        const code = document.querySelector(directive.colorize);

        const response = await fetch('http://127.0.0.1:8080/projects/examples/docs/data/index.js');
        const string = await response.text();

        code.innerHTML = "<span>x</span>";
        const fontWidth = code.querySelector('span').getBoundingClientRect().width;

        console.log({ fontWidth });

        code.innerText = string;

        const codeHeight = code.getBoundingClientRect().height;
        const colorMask = document.querySelector(
          `${directive.colorize}-colormask`
        );
        const lines = code.innerText.split("\n");
        const lineHeight = codeHeight / (lines.length - 1);

        function generateFilteredTags({ lines, filters }) {
          return filters.reduce(
            (acc, filter) => {
              return acc.lines.reduce(
                (acc, line, lineNum) => {
                  acc.tags = [
                    ...acc.tags,
                    ...[...line.matchAll(filter.regex)].map((match) => {
                      acc.lines[lineNum] = acc.lines[lineNum].replace(
                        match[0],
                        " ".repeat(match[0].length)
                      );
                      return {
                        index: match.index,
                        x: match.index * fontWidth,
                        y: lineNum * lineHeight,
                        w: match[0].length * fontWidth,
                        filter: filter.filters,
                      };
                    }),
                  ];
                  return acc;
                },
                { lines, tags: acc.tags }
              );
            },
            { lines, tags: [] }
          );
        }

        const generated = generateFilteredTags({ lines, filters });

        console.log(generated);

        colorMask.innerHTML = generated.tags.reduce((acc, d) => {
          return `${acc}
        <div
          style="height: ${lineHeight}px;
          width: ${d.w}px;
          top: ${d.y}px;
          left: ${d.x}px; 
          position: absolute;
          mix-blend-mode: screen;
          backdrop-filter: ${d.filter};">
        </div>`;
        }, ``);
      },
    });
  }

  return next(directive);
};

export const ctrl = createController(colorizeCodeMiddleware);

function colorizeFlow() {
  return [{ colorize: "#code" }];
}

ctrl.push(colorizeFlow);
