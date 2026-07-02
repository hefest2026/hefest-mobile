// Ambient declarations for CSS side-effect / module imports (NativeWind global
// stylesheet and `*.module.css` files) so the type-checker can resolve them.
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
