const HtmlTemplate = "plop-templates/html.hbs";

const actionsHtml = () => {
  let actions = [];

  actions = [
    {
      type: "add",
      path: "{{path}}/{{kebabCase name}}.html",
      templateFile: HtmlTemplate,
    },
  ];
  return actions;
};

module.exports = (plop) => {
  // plop.addHelper("compare", function (a, b, options) {
  //   if (a == b) {
  //     //满足添加继续执行
  //     return options.fn(this); // 固定写法
  //   } else {
  //     //不满足条件执行{{else}}部分
  //     return options.inverse(this);
  //   }
  // });

  plop.setGenerator("c", {
    description: "component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is name?",
        default: "hello",
      },
      {
        type: "input",
        name: "title",
        message: "What is title?",
      },
      {
        type: "input",
        name: "path",
        message: "What is path?",
        default: "./",
      },
    ],
    actions: () => {
      return actionsHtml();
    },
  });
};
