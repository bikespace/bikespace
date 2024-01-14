const React = require("react")
const plugin = jest.requireActual("gatsby-plugin-image")

const mockImage = ({ imgClassName, ...props }) =>
  React.createElement("img", {
    ...props,
    className: imgClassName,
  })

module.exports = {
  ...plugin,
  GatsbyImage: jest.fn().mockImplementation(mockImage),
  StaticImage: jest.fn().mockImplementation(mockImage),
}