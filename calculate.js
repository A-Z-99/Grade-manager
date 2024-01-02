let grades = {
    gradebounds: {
        "maxpercent": 100,
        "A+percent": 95,
        "Apercent": 90,
        "A-percent": 85,
        "B+percent": 80,
        "Bpercent": 75,
        "B-percent": 70,
        "C+percent": 65,
        "Cpercent": 60,
        "C-percent": 55,
        "Dpercent": 50,
        "Fpercent": 0
    },
    gradecount: {
        "A+percent": 0,
        "Apercent": 0,
        "A-percent": 0,
        "B+percent": 0,
        "Bpercent": 0,
        "B-percent": 0,
        "C+percent": 0,
        "Cpercent": 0,
        "C-percent": 0,
        "Dpercent": 0,
        "Fpercent": 0
    },
    highestString: "",
    lowestString: "",
    highest: 0,
    lowest: 100,
    mean: 0,
    median: 0
};
//function to update grade bound
function updateBound(event){
    const value = parseFloat(event.target.textContent);
    if (!isNaN(value) && (value <= grades.gradebounds.maxpercent || event.target.id == "maxpercent")){
        grades.gradebounds[event.target.id] = value;
        partialparseData();
    }
    else if (event.target.textContent == ""){
        return;
    }
    else{
        window.alert(event.target.textContent + " is not a valid input");
        event.target.textContent = grades.gradebounds[event.target.id];
    }
}

//function to parse data and call renderStats. Only updates gradecount.
function partialparseData(){
    let inputFile = fileInput.files[0];
    if(inputFile != null){
        inputFile.text().then(inputString => {
            if (inputString != null){
                //Initialize all gradecount members to 0;
                for(let grade in grades.gradecount){
                    grades.gradecount[grade] = 0;
                }
                //Iterate over data and parse into an array
                let gradeArray = [];
                let entries = inputString.split('\n');
                let numEntries = entries.length;
                //eliminate first row entry if NaN
                if(isNaN(parseFloat(entries[0].split(',')[1]))){
                    numEntries--;
                    entries.shift();
                }
                //eliminate last row entry if blank
                if(entries[numEntries-1] == ""){
                    entries.pop()
                    numEntries--;
                }
                for (let i = 0; i<numEntries; i++){
                    let sections = entries[i].split(',');
                    gradeArray.push(parseFloat(sections[1]));
                }
                //start iterating over the data
                let keyArr = Object.keys(grades.gradecount);
                for(let i = 0; i<numEntries; i++){
                    let currentEntry = gradeArray[i];
                    //Increment appropriate member of gradeCount
                    let keyNum = 0;
                    while(grades.gradebounds[keyArr[keyNum]] > currentEntry){
                        keyNum++;
                    } 
                    grades.gradecount[keyArr[keyNum]]++;
                }
                renderStats();
            }
        })
    }
}

//function to render histogram and stats
function renderStats(){
    unrenderBars();
    //update stats
    const statsSection = document.getElementById("stats");
    const tdElements = statsSection.querySelectorAll("td:nth-child(2n)");
    tdElements[0].textContent = grades.highestString;
    tdElements[1].textContent = grades.lowestString;
    tdElements[2].textContent = grades.mean;
    tdElements[3].textContent = grades.median;
    //render the histogram
    //Can hold 3 students per grade by default
    //Use ceil(max(gradecount)/3) to calculate the scale. multiply the y-axis by scale and allocate (40//3/scale) vh per student
    let maxHeight = 40;
    let scale = 1;
    let maxGradecount = 1;
    for(let grade in grades.gradecount){
        if(grades.gradecount[grade] > maxGradecount){
            maxGradecount = grades.gradecount[grade];
        }
    }
    scale = Math.ceil(maxGradecount/3);
    //generate the y-axis
    let yaxis = [3,2,1];
    let ylabels = document.querySelectorAll(".y-label");
    for (let i = 0; i<ylabels.length-1; i++){
        ylabels[i].textContent = yaxis[i] * scale;
    }
    //create plot elements
    const histogram = document.getElementById("histogram-plot");
    for(let grade in grades.gradecount){
        const bar = document.createElement('div');
        bar.classList.add('histogram-bar');
        let initialHeight = grades.gradecount[grade] * maxHeight/3/scale;
        if (initialHeight == 0){ //give the bar a negligible height so it still renders
            bar.style.height = 0.5 + 'px';
        }
        else {
            //make a slight adjustment to fit better with y-axis
            bar.style.height = Math.round(initialHeight - Math.pow(initialHeight, 2)/1000) + 'vh';
        }
        histogram.appendChild(bar);
    }
}

//function to unrender previous bars if any are still there
function unrenderBars(){
    let bars = document.querySelectorAll('.histogram-bar');
    for(let i = 0; i<bars.length; i++){
        bars[i].remove();
    }
}

//function to parse data to be stored in grades object and call renderStats
function parseData(){
    let inputFile = fileInput.files[0];
    inputFile.text().then(inputString => {
        if (inputString != null){
            //Iterate over data and parse into an array
            let nameArray = [];
            let gradeArray = [];
            let entries = inputString.split('\n');
            let numEntries = entries.length;
            //eliminate first row entry if NaN
            if(isNaN(parseFloat(entries[0].split(',')[1]))){
                numEntries--;
                entries.shift();
            }
            //eliminate last row entry if blank
            if(entries[numEntries-1] == ""){
                entries.pop()
                numEntries--;
            }
            for (let i = 0; i<numEntries; i++){
                let sections = entries[i].split(',');
                //remember to strip out excessive space
                nameArray.push(sections[0].trim());
                gradeArray.push(parseFloat(sections[1]));
            }
            //Initialize highest=0 and lowest=max 
            grades.highest = 0;
            grades.lowest = grades.gradebounds.maxpercent;
            //Initialize mean and median to 0
            grades.mean = 0;
            grades.median = 0;
            //Initialize all gradecount members to 0;
            for(let grade in grades.gradecount){
                grades.gradecount[grade] = 0;
            }
            //start iterating over the data
            let keyArr = Object.keys(grades.gradecount);
            for(let i = 0; i<numEntries; i++){
                let currentEntry = gradeArray[i];
                //Calculate mean by currentEntry
                grades.mean += currentEntry;
                //If currentEntry is >= highest, update string and value
                if(currentEntry >= grades.highest){
                    grades.highest = currentEntry;
                    grades.highestString = nameArray[i] + " (" + currentEntry + "%)";
                }
                //If currentEntry <= lowest, update string and value
                if(currentEntry <= grades.lowest){
                    grades.lowest = currentEntry;
                    grades.lowestString = nameArray[i] + " (" + currentEntry + "%)";
                }
                //Increment appropriate member of gradeCount
                let keyNum = 0;
                while(grades.gradebounds[keyArr[keyNum]] > currentEntry){
                    keyNum++;
                } 
                grades.gradecount[keyArr[keyNum]]++;
            }
            //apply weight on mean
            grades.mean = (grades.mean/numEntries).toFixed(2);
            //sort and calculate median
            gradeArray.sort((a, b) => a - b);
            //careful to avoid off-by-one errors
            if(numEntries%2 == 0){
                grades.median = ((gradeArray[numEntries/2-1] + gradeArray[numEntries/2])/2).toFixed(2);
            }
            else {
                grades.median = gradeArray[Math.ceil(numEntries/2-1)];
            }
            renderStats();
        }
    })
    
}

//get file element
const fileInput = document.getElementById("data-input");
fileInput.addEventListener("change", parseData);

//add event listeners for all the grade bounds
const boundInputs = document.querySelectorAll(".bound-input");
boundInputs.forEach(bound => {
    bound.addEventListener("input", updateBound);
})