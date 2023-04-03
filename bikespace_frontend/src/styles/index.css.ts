import { style, globalStyle } from "@vanilla-extract/css"

globalStyle(`body`, {
    fontSize: `18px`,
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    backgroundColor: '#5f5b6b',
    margin: 0,
    padding: 0,
})

export const main = style({
    height: "100%",
    width: "100%",
    display: 'flex',
    flexDirection: 'column'
})

export const logo = style({
    width: 200
})

export const title = style({
    color: "white",
    fontSize: 40,
    textShadow: "1px, 1px, 10px, black",
})

export const button = style({
    marginTop: 60,
    padding: 15,
    borderRadius: 50,

    backgroundColor: "green",
    color: "white",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "1px, 1px, 10px, black",
})