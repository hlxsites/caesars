const loadScript = (url, callback, attrs) => {
    console.log("enters here")
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (attrs) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const attr in attrs) {
      script.setAttribute(attr, attrs[attr]);
    }
  }
  script.onload = callback;
  console.log("script = " + script);
  head.append(script);
  return script;
};

const embedFormstackForm = () => {
  // PDF Viewer for doc pages
  loadScript(
    'https://caesars.formstack.com/forms/js.php/linq_leisure_concierge_copy_copy',
  );
};

export default async function decorate(block) {
  const form = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadScript(
          'https://caesars.formstack.com/forms/js.php/linq_leisure_concierge_copy_copy',
        );
      }
    });
  });
  form.observe(block);
}

// export default function decorate(block) {
//   const inquiryFormScript = document.createElement('script');
//   inquiryFormScript.type = 'text/javascript';
//   inquiryFormScript.src =
//     'https://caesars.formstack.com/forms/js.php/linq_leisure_concierge_copy_copy';
//   const inquiryFormNoScript = document.createElement('noscript');
//   const aHref = document.createElement('a');
//   aHref.title = 'Online Form';
//   aHref.href =
//     'https://caesars.formstack.com/forms/linq_leisure_concierge_copy_copy';
//   inquiryFormNoScript.appendChild(aHref);
//   aHref.textContent = 'Online Form - Caesars Palace Concierge';
//   block.appendChild(inquiryFormScript);
//   block.appendChild(inquiryFormNoScript);
// }
