const defaults = {
  layout: {
    dragmode: false,
    paper_bgcolor: 'rgba(0,0,0,0)', // reset chart background to transparent to give more CSS control
    modebar: {
      color: cssVarHSL('--color-primary-d50p', 'string'),
      activecolor: cssVarHSL('--color-primary', 'string'),
      bgcolor: 'rgba(0,0,0,0)',
    },
  },
  config: {
    displaylogo: false,
    modeBarButtonsToRemove: [
      'zoom2d',
      'pan2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'resetScale2d',
    ],
  },
};

/**
 * Function to return values for a hsl CSS variable color
 * @param {string} key CSS variable name
 * @param {string=} return_type Type of value to return; default is "object", but can also be "string"
 * @returns {Object} Object with attributes 'hue', 'saturation', and 'lightness'
 */
function cssVarHSL(key, return_type = 'object') {
  let hsl_str = getComputedStyle(
    document.documentElement,
    null
  ).getPropertyValue(key);
  let pattern =
    /hsl\((?<hue>\d{1,3})\s?,\s?(?<saturation>\d{1,3})\%\s?,\s?(?<lightness>\d{1,3})\%\s?\)/;
  let match = pattern.exec(hsl_str);
  if (return_type == 'string') {
    return hsl_str;
  } else {
    return {
      hue: Number(match.groups.hue),
      saturation: Number(match.groups.saturation),
      lightness: Number(match.groups.lightness),
    };
  }
}

/**
 * Function to generate an array of colors from a start and finish color
 * @param {Object} start Object with attributes 'hue', 'saturation', and 'lightness'
 * @param {Object} finish Object with attributes 'hue', 'saturation', and 'lightness'
 * @param {number} steps Length of array to return, including start and finish entries
 * @param {boolean} [increase=True] Whether values go up from start to finish (True, default) or down (False)
 * @returns {Array} An array of hsl colors
 */
function hslRange(start, finish, steps, increase = true) {
  let rel_finish_hue;
  if (finish.hue < start.hue) {
    rel_finish_hue = finish.hue + 360;
  } else {
    rel_finish_hue = finish.hue;
  }
  let hue_var = rel_finish_hue - start.hue;
  let hue_step = hue_var / (steps - 1);
  let colors = [start];
  for (let i = 1; i < steps - 1; increase ? i++ : i--) {
    colors.push({
      hue: Math.round(start.hue + i * hue_step) % 360,
      saturation: start.saturation,
      lightness: start.lightness,
    });
  }
  colors.push(finish);
  let color_strings = colors.map(
    c => `hsl(${c.hue}, ${c.saturation}%, ${c.lightness}%)`
  );
  return color_strings;
}

export {defaults, cssVarHSL, hslRange};
