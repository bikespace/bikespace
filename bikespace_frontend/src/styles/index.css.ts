import {style, globalStyle} from '@vanilla-extract/css';

globalStyle('body', {
  fontSize: '18px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  backgroundColor: '#5f5b6b',
  margin: 0,
  padding: 0,
});

export const main = style({
  position: 'absolute',
  bottom: 0,
  top: 0,
  left: 0,
  right: 0,
  overflowY: 'scroll',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flex: '1 1 auto',
});

export const mainContent = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  gap: 25,
  flexGrow: '1',
});

export const footerNav = style({
  position: 'relative',
});

export const logo = style({
  flex: '1 1 50px',
  maxWidth: 200,
  maxHeight: 200,
});

export const title = style({
  color: 'white',
  fontSize: 40,
  textShadow: '1px 1px 10px black',
});

export const button = style({
  padding: 15,
  borderRadius: 50,

  backgroundColor: 'green',
  color: 'white',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '1px 1px 10px black',
});
