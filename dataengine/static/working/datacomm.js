// datacomm.js
// Hillman
// Sep 2021


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



  var tcols =      [ 
  {"field":"id","title":"ID"},
  {"field": "title", width:150, title: "Title",editor:"input"},
  {"field": "content", title: "Initial Input",width:400, formatter:"textarea",editor: "textarea"},
  {"field":"keywords", "title":"Keywords",editor: "textarea"},
  {"field":"source", "title":"Source",editor: "input"},
  {"field":"datecreated", "title":"Date Created",editor:"input"},
  {"field":"contact", "title":"Contact",editor: "input"},
  {"field":"email", "title":"E-Mail",editor: "input"},
  {"field":"comment", "title":"Initial Comment", width:300,editor: "textarea"},
  
    ]
  

tabledec = new Tabulator("#tab-table", {
  data: [], 
  height:600,
  columns: tcols,

});



var jtest3 = [
  {"id":1,"title":"dapibus nulla suscipit ligula in lacus curabitur at ipsum ac","content":"Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.\n\nMaecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.\n\nNullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris.\n\nMorbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.\n\nFusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.","keywords":"lobortis sapien sapien non mi integer ac neque","source":"https://hostgator.com/pede/justo/lacinia.aspx?nibh=duis&ligula=ac","datecreated":"12/15/2020","contact":"Shurwood Eddisford","email":"seddisford0@blogtalkradio.com","comment":""},
  
  {"id":1,"title":"","content":"","keywords":"","source":"","datecreated":"12/20/2020","contact":"Jon Smith","email":"jsmith@blogtalkradio.com","comment":"This is commentary on the original"},
  
  {"id":1,"title":"","content":"","keywords":"","source":"","datecreated":"12/21/2020","contact":"Ben Jones","email":"Bjones@blogtalkradio.com","comment":"This is even more  commentary on the original that was written"},
  
  ]
