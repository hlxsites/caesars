let formstackTmp = '';

function loadScript(url) {
  const formstack = document.createElement('formstack');
  const script = document.createElement('script');
  script.src = url;
  const noscript = document.createElement('noscript');
  const noscriptAnchor = document.createElement('a');
  noscriptAnchor.href = url;
  noscriptAnchor.title = 'Online form';
  formstack.append(script);
  formstack.append(noscript);
  window.formStackContent = {};
  return formstack;
}

// Unfortunately, we have to override document.write calls from the formstack code
// because we cannot move away from it and there are no other better options yet.
// eslint-disable-next-line func-names
document.write = function (s) {
  formstackTmp = formstackTmp.concat(s);
  window.formStackContent = {
    value: formstackTmp,
  };
};

// const formstack = document.querySelector('formstack');
// formstack.innerHTML = formStackContent;

// document.write = function (s) {
//   const fsBodyEmbed = /.*?fsBody fsEmbed.*?/;
//   const openDiv = /<div.*?>/;
//   const closeDiv = /.*?<\/div>/;
//   const formstack = document.querySelector('formstack');
//   if (fsBodyEmbed.test(s)) {
//     formstack.innerHTML += s;
//   } else {
//     const fsBody = formstack.querySelector(':scope > .fsBody.fsEmbed');
//     if (openDiv.test(s)) {

//     } else if (closeDiv.test(s)) {
//       fsBody.innerHTML += s;
//     }
//     // console.log(`s is ${s}`);
//   }
// };

// eslint-disable-next-line func-names
// document.write = function (parameter) {
//   if (!parameter) return;
//   const scriptPattern = /<script.*?src=['|"](.*?)['|"]/;
//   const stylePattern = /<style.*?type=['|"](.*?)['|"]/;
//   if (scriptPattern.test(parameter)) {
//     const srcAttribute = scriptPattern.exec(parameter)[1];
//     const script = document.createElement('script');
//     script.src = srcAttribute;
//     document.head.appendChild(script);
//   } else if (stylePattern.test(parameter)) {
//     const srcAttribute = scriptPattern.exec(parameter)[1];
//     const script = document.createElement('script');
//     script.src = srcAttribute;
//     document.head.appendChild(script);
//   } else {
//     const formstack = document.querySelector('formstack');
//     if (formstack) formstack.innerHTML += parameter;
//   }
// };

export default function decorate(block) {
  const formstackLink = block.querySelector('a');
  if (formstackLink && formstackLink.href) {
    const formstackUrl = formstackLink.href;
    block.innerHTML = '';
    const form = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          block.append(loadScript(formstackUrl));
          window.setTimeout(() => {
            const saveToDom = document.createElement('script');
            saveToDom.type = 'text/javascript';
            const saveToDomScript = 'const formstackDiv = document.querySelector(\'formstack\'); formstackDiv.innerHTML = window.formStackContent.value;';
            saveToDom.append(saveToDomScript);
            document.head.appendChild(saveToDom);
          }, 3000);
        }
      });
    });
    form.observe(block);
  } else {
    block.remove();
  }
}
