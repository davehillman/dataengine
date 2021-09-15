// dataeng.js
// Hillman
// Sep 2021

// --------------------------------------------------------------------

//Filter functions follow

//Define variables for input elements
var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");

//Custom filter example
function customFilter(data){
    return data.car && data.rating < 3;
}

//Trigger setFilter function with correct parameters
function updateFilter(){
  var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
  var typeVal = typeEl.options[typeEl.selectedIndex].value;

  var filter = filterVal == "function" ? customFilter : filterVal;

  if(filterVal == "function" ){
    typeEl.disabled = true;
    valueEl.disabled = true;
  }else{
    typeEl.disabled = false;
    valueEl.disabled = false;
  }

  if(filterVal){
    tabledec.setFilter(filter,typeVal, valueEl.value);
  }
}

//Update filters on value change
document.getElementById("filter-field").addEventListener("change", updateFilter);
document.getElementById("filter-type").addEventListener("change", updateFilter);
document.getElementById("filter-value").addEventListener("keyup", updateFilter);

//Clear filters on "Clear Filters" button click
document.getElementById("filter-clear").addEventListener("click", function(){
  fieldEl.value = "";
  typeEl.value = "=";
  valueEl.value = "";

  tabledec.clearFilter();
});



// --------------------------------------------------------

 function progressColor(value) {
    let returnColor = "#E02020"; // Frowning Red
    if (80 <= value) {
      returnColor = "#40FF40";   // Happy Green
    } else if (50 < value) {
      returnColor = "#FFFF40";   // Sunshine Yellow
    }
    return returnColor;
  }
  
//Create Date Editor
var dateEditor = function(cell, onRendered, success, cancel){
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass the successfuly updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell

    //create and style input
    var cellValue = moment(cell.getValue(), "MM/DD/YYYY").format("YYYY-MM-DD"),
    input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value != cellValue){
            success(moment(input.value, "YYYY-MM-DD").format("MM/DD/YYYY"));
        }else{
            cancel();
        }
    }

    //submit new value on blur or change
    input.addEventListener("blur", onChange);

    //submit new value on enter
    input.addEventListener("keydown", function(e){
        if(e.keyCode == 13){
            onChange();
        }

        if(e.keyCode == 27){
            cancel();
        }
    });

    return input;
};


const _MS_PER_DAY = 1000 * 60 * 60 * 24;
// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


//-----------------------------------------------------------
// following is the track columns for the main dashboard view
var tcols =      [ 
	{field: "__rid__", visible:false}

  ]

  var tcolsedit =      [ 
    {field: "__rid__", visible:false}
    ]


   

var tabledec = new Tabulator("#tab-table", {
  data: [], //dtest,
  layout:"fitDataStretch",
  height:500,
  addRowPos: true,
  autoColumns: true,
//  layout:"fitColumns",
  tooltips: true,
  movableColumns: true,     //allow column order to be changed  
  columns: tcols,
//following loads the edit table
  rowClick:function(e, row){ 
    tditem = row.getData().__rid__;
    $.ajax({
      type:'GET',
      url: commonpath + '/getedit',
      data: {did: did,rid: tditem},
      async: true,
      success: function(data){
        dslist = JSON.parse(data);
        vlist = true;
        for (i=0; i<tabledecedit.getDataCount(); i++ ) {
          if (tditem == tabledecedit.getData()[i].__rid__) vlist = false
        }
        if (vlist) {
          if (tabledecedit.getDataCount("active") > 0) tabledecedit.addData(dslist)
          if (tabledecedit.getDataCount("active") == 0) tabledecedit.setData(dslist)
        }
        tabledecedit.hideColumn("__rid__");
        document.getElementById("btnupdate").style = "show";
        document.getElementById("btndelete").style = "show";
        document.getElementById("btnclear").style = "show";

      },
      error: function(error){
        console.log(JSON.stringify(error))
      }
    })  
  }
});


var tabledecedit = new Tabulator("#tab-table2", {
//  data: [], //dtest,
  layout:"fitDataStretch",
  tooltips: true,
  autoColumns: true,
  autoColumnsDefinitions:function(definitions){
    //definitions - array of column definition objects

    definitions.forEach((column) => {
        column.editor = "input"; // add header filter to every column
    });

    return definitions;
},
//  layout:"fitColumns",
  pagination: "local",      
  paginationSize: 5,       
  movableColumns: true,     //allow column order to be changed  
  columns: tcols,
});

