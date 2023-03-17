import Head from 'next/head';
import config from '../main.config';
import Components from '../templates/templates.module';
import fs from 'fs';
import path from 'path';
export default function Template({ meta, header, sections, footer }) {
  return (
    <div>
      <Head>
        <title>{meta.title}</title>
        <meta name='description' content={meta.description}></meta>
        <meta name='robots' content={meta.robots}></meta>
        <link rel='icon' href={meta.favicon} />
      </Head>
      <main>
        {header ? <Header {...header}></Header> : null}
        {sections.map(({ id, template, props }) => {
          const Component = Components.sections[template];
          return <Component key={id} {...props}></Component>;
        })}
        {footer ? <Footer {...footer}></Footer> : null}
      </main>
    </div>
  );
}

const Header = ({ id, template, props }) => {
  const Component = Components.headers[template];
  return <Component key={id} {...props}></Component>;
};
const Footer = ({ id, template, props }) => {
  const Component = Components.footers[template];
  return <Component key={id} {...props}></Component>;
};

export async function getStaticPaths() {
  const base_url = 'opensource.maplelabs.com';
  const paths = await getAllPaths(config);
  const dynamicPaths = paths.map((path) => {
    return `${base_url}/${path.join('/')}`;
  });
  const allPaths = [...dynamicPaths];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPaths
    .map((url) => {
      return `<url>
          <loc>${url}</loc>
        </url>`;
    })
    .join('')}
</urlset>
`;
  fs.writeFileSync(
    path.join(process.cwd(), `public/sitemap.xml`),
    sitemap,
    'utf-8'
  );
  return {
    // paths: [{ params: { slug: ['temp', 'blogs'] } }],
    paths: paths.map((path) => ({ params: { slug: path } })),
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { slug } = context.params;
  const extractTemplate = async (item) => {
    const dynamicData = item.dynamicData ? await item.dynamicData(context) : {};
    return {
      id: item.id,
      template: item.template,
      props: { id: item.id, ...item.data, ...dynamicData },
    };
  };
  let pageConfig = config;
  await Promise.all(
    slug?.map(async (page) => {
      let pages = [];
      if (pageConfig.pages instanceof Function) {
        pages = await pageConfig.pages();
      } else {
        pages = pageConfig.pages;
      }
      pageConfig = {
        ...{ ...pageConfig, body: { sections: [] } },
        ...pages[page],
      };
    }) || []
  );
  const meta = pageConfig.meta;
  const sections = await Promise.all(
    pageConfig?.body?.sections.map(extractTemplate) || []
  );
  const header = pageConfig?.header
    ? await extractTemplate(pageConfig.header)
    : null;
  const footer = pageConfig?.footer
    ? await extractTemplate(pageConfig.footer)
    : null;
  return { props: { meta, header, sections, footer } };
}

const getAllPaths = async (config) => {
  const paths = [[]];
  const getPages = async (pages, slugs = []) => {
    Object.entries(pages || {}).forEach(async ([slug, config]) => {
      const lst = [...slugs];
      lst.push(slug);
      config.body && paths.push(lst);
      let pages = [];
      if (config.pages instanceof Function) {
        pages = await config.pages();
      } else {
        pages = config.pages;
      }
      await getPages(pages, lst);
    });
  };
  await getPages(config.pages);
  return paths;
};
