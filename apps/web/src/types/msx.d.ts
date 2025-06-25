// src/types/mdx.d.ts
declare module "*.mdx" {
  let MDXContent: (props: any) => JSX.Element;
  export default MDXContent;
}
