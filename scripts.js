document.addEventListener('DOMContentLoaded', function() {
    const backgroundColors = [
        'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)', 'rgba(199, 199, 199, 0.6)',
        'rgba(255, 99, 132, 0.6)'
    ];

    function loadAndCreateChart(url, canvasId, chartType = 'bar', isStacked = false) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load data: ' + response.statusText);
                return response.json();
            })
            .then(data => {
                const ctx = document.getElementById(canvasId).getContext('2d');
                createBarChart(ctx, data, canvasId, chartType, isStacked, backgroundColors);
            })
            .catch(error => console.error('Error parsing data for:', canvasId, error));
    }

    function createBarChart(ctx, data, canvasId, chartType, isStacked, colors) {
        new Chart(ctx, {
            type: chartType,
            data: {
                labels: data.map(item => item.year),
                datasets: data[0] && Object.keys(data[0])
                    .filter(key => key !== 'year' && key !== 'total')
                    .map((key, index) => ({
                        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                        data: data.map(item => item[key]),
                        backgroundColor: colors[index % colors.length]
                    }))
            },
            options: {
                scales: {
                    x: { stacked: isStacked },
                    y: { stacked: isStacked, beginAtZero: true }
                },
                responsive: true,
                plugins: { legend: { position: 'top' } },
                barPercentage: 0.7,
                categoryPercentage: 0.9
            }
        });
    }

    // Scroll effect with debounce for performance improvement
    let timer;
    window.addEventListener('scroll', function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            document.querySelectorAll('.section, blockquote').forEach(section => {
                const position = section.getBoundingClientRect();
                const screenPosition = window.innerHeight;

                if (position.top < screenPosition && position.bottom > 0) {
                    section.classList.add('visible');
                } else {
                    section.classList.remove('visible');
                }
            });
        }, 100);
    });

    // Load charts for each dataset
    ['data/american_psilocybin.json', 'data/COcrime_DUI.json', 'data/COcrime_totaldrug.json',
     'data/MAcrime.json', 'data/ORcrime_hallucinogen_related.json'].forEach((file, index) => {
         loadAndCreateChart(file, ['psilocybinChart', 'COcrimeDUIGraph', 'totalDrugCrimesGraph', 'MACrimesGraph', 'ORCrimesGraph'][index], 'bar', false);
     });
     // D3 - California

     function createD3Chart(data) {
        const parsedData = [];
        const years = Object.keys(data[0]);
        const values = Object.values(data[0]);
    
        years.forEach((year, index) => {
            parsedData.push({year: year, value: values[index]});
        });
    
        // Set the dimensions of the canvas / graph
        const margin = {top: 30, right: 20, bottom: 70, left: 50},
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
    
        // Adds the svg canvas
        const svg = d3.select("#d3-chart-container")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", 
                      "translate(" + margin.left + "," + margin.top + ")");
    
        // Define the div for the tooltip
        const tooltip = d3.select("#d3-tooltip");

        // Set the ranges
        const x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);
        const y = d3.scaleLinear()
              .range([height, 0]);
              
        // Scale the range of the data in the domains
        x.domain(parsedData.map(function(d) { return d.year; }));
        y.domain([0, d3.max(parsedData, function(d) { return d.value; })]);
    
        // Append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(parsedData)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.year); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year}<br/>Value: ${d.value}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    
        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
    
        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
    }
    
    // Assuming the data is loaded through your existing loadData function or directly as shown:
    createD3Chart([
        {"2018": 2881, "2020": 4194, "2022": 3476}
    ]);   

    // OR waffle chart

    function createORCrimeWaffleChart(data) {
        const colors = {
            "dui": "#ef476f",
            "property": "#ffd166",
            "violence_assault": "#06d6a0",
            "other": "#118ab2"
        };
        const categories = ["dui", "property", "violence_assault", "other"];  // Array of categories for legend
        const waffleSize = 13; // Define the size of each square
        const squaresPerRow = 10; // Define how many squares per row
    
        data.forEach((yearData, index) => {
            const svg = d3.select("#orCrimeWaffleContainer").append("svg")
                .attr("width", 220)
                .attr("height", 240);  // Increased height to include year label at top
    
            const g = svg.append("g")
                .attr("transform", "translate(10, 40)");  // Adjust top margin to include year label
    
            // Add year label at the top of each chart
            svg.append("text")
                .attr("x", 110)  // Center in the SVG width
                .attr("y", 20)  // Position at the top
                .attr("text-anchor", "middle")  // Center the text alignment
                .style("font-size", "14px")
                .style("font-family", "Arial, sans-serif")
                .text(`Year ${yearData.year}`);
    
            let cumulativeCount = 0; // Tracks the number of squares placed so far
    
            Object.keys(colors).forEach(category => {
                if (yearData[category]) {
                    const count = yearData[category];
                    for (let i = 0; i < count; i++) {
                        const xPosition = (cumulativeCount % squaresPerRow) * (waffleSize + 1);
                        const yPosition = Math.floor(cumulativeCount / squaresPerRow) * (waffleSize + 1);
    
                        g.append("rect")
                            .attr("class", "square")
                            .attr("x", xPosition)
                            .attr("y", yPosition)
                            .attr("width", waffleSize)
                            .attr("height", waffleSize)
                            .attr("fill", colors[category]);
    
                        cumulativeCount++; // Increment the count after placing each square
                    }
                }
            });
        });
    
        // Create a single legend at the bottom
        const legendSvg = d3.select("#orCrimeWaffleContainer").append("svg")
            .attr("width", 1000)  // Adjust based on the total width needed
            .attr("height", 50);  // Reduced height since it's only one row
    
        const legend = legendSvg.selectAll(".legend")
            .data(categories)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${100 + i * 150}, 10)`);  // Adjust transformation for better positioning
    
        legend.append("rect")
            .attr("width", 120)
            .attr("height", 20)
            .style("fill", d => colors[d]);
    
        legend.append("text")
            .attr("x", 24)
            .attr("y", 14)
            .attr("dy", ".35em")
            .text(d => d.charAt(0).toUpperCase() + d.slice(1).replace(/_/g, ' '))
            .style("text-anchor", "start")
            .style("font-size", "11px");
    }
    
    // Load data and create waffle chart
    fetch('data/ORcrime_hallucinogen_related.json')
        .then(response => response.json())
        .then(data => {
            createORCrimeWaffleChart(data);
        })
        .catch(error => console.error('Error loading OR crime data:', error));
    
    
    
    
});


