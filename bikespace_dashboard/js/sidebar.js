class SummaryBox extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // Calculate date range of entries
    let submission_dates = shared_state.display_data.map((s) => new Date(s.parking_time));
    let earliest_entry = submission_dates.reduce((p, c) => p < c ? p : c);
    let latest_entry = submission_dates.reduce((p, c) => p > c ? p : c);

    // Date formatting 
    const date_options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    let content = [
      `<div id="entry-count">${shared_state.display_data.length.toLocaleString('en-CA')}</div>`,
      `<div class="summary-desc">Total Reports</div>`,
      `<div class="summary-desc">${earliest_entry.toLocaleDateString('en-CA', date_options)} – ${latest_entry.toLocaleDateString('en-CA', date_options)}</div>`
    ].join("");

    $(`#${root_id}`).append(content);

  }
}
  
class IssueChart extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);

    // Note: no option for spacing between y-axis labels and y-axis line in plotly js, have to add a trailing space
    const issue_labels = {
      'not_provided': "No nearby parking ",
      'full': "Parking was full ",
      'damaged': "Parking was broken ",
      'abandoned': "Abandoned bicycle ",
      'other': "Other issue "
    };

    const issue_labels_lookup = Object.fromEntries(Object.entries(issue_labels).map(a => a.reverse()));

    // summarize data
    let issues = new Set(shared_state.display_data.reduce(
      (a, b) => a.concat(b['issues']), [])
      );
    let data = [];
    for (let issue of issues) {
      data.push({
        'type': issue,
        'count': shared_state.display_data.reduce(
          (a, b) => a + (b['issues'].includes(issue) ? 1 : 0), 0
          ),
        'label': issue_labels[issue] ?? issue
      });
    }

    // sort data ascending (shows descending in chart, bars are added bottom to top)
    // this could be done with layout.yaxis.categoryorder in plotly js, but it messes up the color gradient
    data.sort((a, b) => a.count - b.count);

    // generate colour palette
    let palette = hslRange(
      cssVarHSL("--color-secondary-red"),
      cssVarHSL("--color-primary"),
      data.length
    );

    // Build chart components
    let plot = document.getElementById('issue-chart');

    let chart_data = [{
      type: 'bar',
      orientation: 'h', // horizontal
      x: data.map((x) => x.count),
      y: data.map((x) => x.type),
      marker: {
        color: palette.reverse(), // Plotly adds bars bottom to top
      },
      text: data.map((x) => x.count.toString()),
      hoverinfo: "none" // remove hover labels
    }];
    
    let layout = {
      title: {
        text: "Problem Type Frequency",
        x: 0,
        pad: {
          l: 4
        }
      },
      yaxis: {
        labelalias: issue_labels, 
        fixedrange: true // prevent user zoom
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },
      margin: {
        t: 30,
        r: 4,
        b: 4,
        l: 120
      },
      width: 320 - 4 * 2,
      height: 200,
      paper_bgcolor: "rgba(0,0,0,0)" // reset chart background to transparent to give more CSS control
    };

    let config = {
      displaylogo: false,
      modeBarButtonsToRemove: [
        'zoom2d',
        'pan2d',
        'select2d',
        'lasso2d',
        'zoomIn2d',
        'zoomOut2d',
        'autoScale2d',
        'resetScale2d'
      ]
    };

    Plotly.newPlot(plot, chart_data, layout, config);

    // dummy functions for use in filtering later
    plot.on('plotly_click', function(data) {
      console.log("bar click", data.points[0].y)
    });

    $(`#${root_id} .ytick`).on('click', function(e){
      let label_text = e.target.attributes['data-unformatted'].value;
      console.log("label click", issue_labels_lookup[label_text]);
    })

  }
}

/**
 * Function to return values for a hsl CSS variable color
 * @param {string} key CSS variable name
 * @returns {Object} Object with attributes 'hue', 'saturation', and 'lightness'
 */
function cssVarHSL(key) {
  let hsl_str = getComputedStyle(document.documentElement, null).getPropertyValue(key);
  let pattern = /hsl\((?<hue>\d{1,3})\s?,\s?(?<saturation>\d{1,3})\%\s?,\s?(?<lightness>\d{1,3})\%\s?\)/;
  let match = pattern.exec(hsl_str);
  return {
    'hue': Number(match.groups.hue),
    'saturation': Number(match.groups.saturation),
    'lightness': Number(match.groups.lightness)
  };
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
  let rel_finish_hue
  if (finish.hue < start.hue) {
    rel_finish_hue = finish.hue + 360;
  } else {
    rel_finish_hue = finish.hue;
  }
  hue_var = rel_finish_hue - start.hue;
  hue_step = hue_var / (steps - 1);
  colors = [start];
  for (let i = 1; i < steps - 1; increase ? i++ : i--) {
    colors.push({
      'hue': Math.round((start.hue + (i * hue_step))) % 360,
      'saturation': start.saturation,
      'lightness': start.lightness
    });
  }
  colors.push(finish);
  color_strings = colors.map(
    (c) => `hsl(${c.hue}, ${c.saturation}%, ${c.lightness}%)`
    );
  return color_strings;
}