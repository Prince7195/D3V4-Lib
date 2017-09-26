
const defaultStyles = {
    width: 960,
    height: 500,
    margin: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 75
    },
    axis: true,
    axisPadding: 2,
    xTicks: 5,
    yTicks: 7
}

interface styles {
    colors: Array<string>
    xAxisColumn: string,
    yAxisColumn: string,
    chartType: string
}

class Draw {
    public element: string;
    public defaultStyles;
    public customData: styles;
    public data: any;
    public innerWidth: number;
    public innerHeight: number;
    public svg;
    public scaleX;
    public scaleY;
    public d3line;
    public chartType;
    constructor(element: string, chartType: string, customData?: styles) {
        this.element = element;
        this.defaultStyles = defaultStyles;
        this.customData = customData;
        this.innerWidth = this.defaultStyles.width - this.defaultStyles.margin.left - this.defaultStyles.margin.right;
        this.innerHeight = this.defaultStyles.height - this.defaultStyles.margin.top - this.defaultStyles.margin.bottom;
        this.chartType = chartType;
        this.chart();
        if (this.chartType == "line") {
            this.lineChart();
        } else if (this.chartType == "column") {
            this.columnChart();
        } else if (this.chartType == "bar") {
            this.barChart();
        }        
    }

    chart() {

        const svg = this.svg = d3.select(this.element)
            .append('svg')
            .attr('width', this.defaultStyles.width)
            .attr('height', this.defaultStyles.height)
            .append('g')
            .attr('transform', `translate(${this.defaultStyles.margin.left}, ${this.defaultStyles.margin.top})`);
    }

    lineChart() {
        const scaleY = this.scaleY = d3.scaleLinear()
            .range([this.innerHeight, 0]);

        const scaleX = this.scaleX = d3.scaleTime()
            .range([0, this.innerWidth]);
        this.d3line = d3.line()
            .x(function (d) { return scaleX(d["date"]); })
            .y(function (d) { return scaleY(d["value"]) });
    }

    barChart() {
        this.scaleX = d3.scaleLinear()
            .range([0, this.innerWidth]);

        this.scaleY = d3.scaleBand()
            .range([this.innerHeight, 0]).padding(0.1);        
    }

    columnChart() {
        this.scaleX = d3.scaleBand()
            .range([0, this.innerWidth]).padding(0.1);

       this.scaleY = d3.scaleLinear()
            .range([this.innerHeight, 0]);       
    }

    drawAxis(data) {
        this.svg.append('g')
            .attr('class', 'axis-x')
            .attr('transform', `translate(0, ${this.innerHeight})`)
            .call(d3.axisBottom(this.scaleX));

        this.svg.append('g')
            .attr('class', 'axis-y')
            .call(d3.axisLeft(this.scaleY));
    }

    drawLine(dataCol) {
        this.scaleX.domain(d3.extent(dataCol, data => data["date"]));
        this.scaleY.domain(d3.extent(dataCol, data => data["value"]));
        d3.select('svg').select('g')
            .append('path')
            .attr('class', 'chart-line')
            .data([dataCol])
            .transition()
            .attr('d', this.d3line);
    }

    drawBar(dataCol) {
        this.scaleX.domain([0, d3.max(dataCol, (data) => { return data["value"] })]);
        this.scaleY.domain(dataCol.map((data) => { return data["date"] }));
        d3.select('svg').select('g').selectAll('.chart-bar')
            .data(dataCol).enter().append('rect')
            .attr('class', 'chart-bar')
            .attr('x', 0)
            .attr('height', this.scaleY.bandwidth())
            .attr('y', (data) => {
                return this.scaleY(data["date"]);
            })
            .attr('width', (data) => {
                return this.scaleX(data["value"]);
            });
    }

    drawColumn(dataCol) {
         this.scaleX.domain(dataCol.map((data) => { return data["date"] }));
         this.scaleY.domain([0, d3.max(dataCol, (data) => { return data["value"] })]);
         d3.select('svg')
             .select('g').selectAll('.chart-column')
             .data(dataCol).enter().append('rect')
             .attr('class', 'chart-column')
            .attr('x', (data) => {
                return this.scaleX(data["date"]);
            })
            .attr('width', this.scaleX.bandwidth())
            .attr('y', (data) => {
                return this.scaleY(data["value"]);
            })
            .attr('height', (data) => {
                return this.innerHeight - this.scaleY(data["value"])
            });
    }

    render(data) {
        this.data = data; 
        if (this.chartType == "line") {
            this.drawLine(this.data);
        } else if (this.chartType == "column") {
            this.drawColumn(this.data);
        } else if (this.chartType == "bar") {
            this.drawBar(this.data);
        }
        
        if (this.defaultStyles.axis) {
            this.drawAxis(this.data);
        }
    }

}