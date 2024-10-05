// Style variables for use in TSX files - should match CSS variables
import styleVars from './variables.module.scss';

// const wrapperFullWidth: number = 1024;
const wrapperFullWidth = parseInt(styleVars.wrapperFullWidth);
console.log('width', wrapperFullWidth, styleVars);

export {wrapperFullWidth};
