/* csv */
function csv(handler) {
  d3.csv("data.csv", (err, data) => {
    let group_a = [];
    let group_b = [];
    let group_c = [];
    let group_d = [];
    let group_e = [];

    let standard = [];
    let fr = [];
    
    data.map(e => {
      let re = e['race/ethnicity'];
      if (re.match(/A/)) {
	group_a.push(e);
      } else if (re.match(/B/)) {
	group_b.push(e);
      } else if (re.match(/C/)) {
	group_c.push(e);
      } else if (re.match(/D/)) {
	group_d.push(e);
      } else if (re.match(/E/)) {
	group_e.push(e);
      } else {
	console.log('no match: ', e);
      }

      let lunch = e['lunch'];
      if (re.match(/free/)) {
	fr.push(e);
      } else {
	standard.push(e);
      }
    });

    let groups = [
      group_a, group_b, group_c, group_d, group_e
    ];

    let lunch = [ standard, fr ];
    
    handler({ groups, lunch });
  });
}


/* Pie */
class Pie {
  static _pre() {
    let width = 360;
    let height = 250;
    let radius = Math.min(width, height) / 2;
    
    var svg = d3.select("#pie")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform",
	"translate(" + width / 2 + "," + height / 2 + ")"
      );
    
    let color = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888"])

    let arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 75)
      .padAngle(0.03)

    let labelArc = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    let pie = d3.pie()
      .sort(null)
      .value(function(d) { return d; });
    
    let ret = {
      svg, pie, arc, labelArc, color
    };

    return ret;
  }

  score(data) {
    let raw = data;
    data = data.groups.map(e => e.length);

    let {
      svg, pie, arc, labelArc, color
    } = Pie._pre();

    var g = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) {
	return color(d.data)
      })
      .on("mouseover", (d, i) => {
	let group = ["A", "B", "C", "D", "E"][i];
	let _data = {};
	_data.groups = [];
	_data.groups[0] = raw.groups[i];
	document.querySelector('#bar').innerHTML = '';
	new Bar().score(_data);
      })

    g.append("text")
      .attr("transform", function(d) {
	return "translate(" + labelArc.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .text(function(d, i) {
	return ["A", "B", "C", "D", "E"][i];
      })
  }
}

class Bar {
  static _pre() {
    let margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 480 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

    // set the ranges
    let x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);
    let y = d3.scaleLinear()
      .range([height, 0]);

    return { width, height, margin, x, y };
  }

  static _averange(data) {
    let mt = 0;
    let rt = 0;
    let wt = 0;

    data.map(e => {
      mt += + e['math score'];
      rt += + e['reading score'];
      wt += + e['writing score'];
    });
    
    let m = mt / data.length;
    let r = rt / data.length;
    let w = wt / data.length;
    
    return [ m, r, w ];
  }

  score(data) {
    data = data.groups[0];

    let { width, height, margin, x, y } = Bar._pre();

    let scores = Bar._averange(data);
    
    var svg = d3.select("#bar")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
        "translate(" + margin.left + "," + margin.top + ")");

    x.domain(['math', 'reading', 'writing']);
    y.domain([d3.min(scores) - 5, d3.max(scores) + 5]);

    svg.selectAll(".bar")
      .data(scores)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("class", "bar")
      .attr("x", function(d, i) {
	return x(['math', 'reading', 'writing'][i]);
      })
      .attr("width", x.bandwidth())
      .attr("y", function(d, i) {
	return y(scores[i]);
      })
      .attr("height", function(d, i) {
	return height - y(scores[i]);
      });

    // add the x Axis
    svg.append("g")
      .attr("transform",
	"translate(0," + height + ")"
      )
      .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
      .call(d3.axisLeft(y))
  }
}


/* Global */
(function() {
  const sel = document.querySelector("#sel");

  let bar = new Bar();
  let pie = new Pie();
  
  csv(bar.score);
  csv(pie.score);
})();

/* selector */
(function(){
  sel.onchange = () => {
    console.log(sel.value)
  }
})();
