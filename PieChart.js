var PieChart = {
	w: 400,
	h: 400,
	r: this.h/2,
	color: d3.scale.category20c(),
	data: [],
	//array of  objects with label and value
	setData: function(values)
	{
		this.data = values;
	},
	draw: function()
	{
	var vis = d3.select('#chart').append("svg:svg")
				.data([this.data]).attr("width", this.w).attr("height", this.h)
				.append("svg:g").attr("transform", "translate(" + this.r + "," + this.r + ")");
	var pie = d3.layout.pie().value(function(d){return d.value;});

	// declare an arc generator function
	var arc = d3.svg.arc().outerRadius(r);

	// select paths, use arc generator to draw
	var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
	arcs.append("svg:path")
	    .attr("fill", function(d, i){
	        return color(i);
	    })
	    .attr("d", function (d) {
	        // log the result of the arc generator to show how cool it is :)
	        console.log(arc(d));
	        return arc(d);
	    });

	// add the text
	arcs.append("svg:text").attr("transform", function(d){
				d.innerRadius = 0;
				d.outerRadius = r;
	    return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "middle").text( function(d, i) {
	    return data[i].label;}
			);
	}
};