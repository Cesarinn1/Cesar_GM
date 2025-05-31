const datos = [
    { id: 1, nombre: "Luis", apellido: "Pérez", correo: "juan.perez@example.com", telefono: "1234567890", comentario: "Comentario 1" },
    { id: 2, nombre: "María", apellido: "González", correo: "Maria.gonzalez@example.com", telefono: "0987654321", comentario: "Comentario 2" },
    { id: 3, nombre: "Marco", apellido: "Vazquez", correo: "Marco.vazquez@example.com", telefono: "32131313", comentario: "Comentario 3" },
    { id: 4, nombre: "Gabriela", apellido: "Martínez", correo: "Gabriela@example.com", telefono: "242224513", comentario: "Comentario 4" },
    { id: 5, nombre: "Koss", apellido: "Fernández", correo: "koss.rivera@example.com", telefono: "231314454514", comentario: "Comentario 5" },
    { id: 6, nombre: "Aitana", apellido: "Ramirez", correo: "Aitana.Ramirez@example.com", telefono: "21121314555", comentario: "Comentario 6" },
    { id: 7, nombre: "Miguel", apellido: "Marin", correo: "miguel.Marin@example.com", telefono: "1233213131", comentario: "Comentario 7" },
    { id: 8, nombre: "Laura", apellido: "Ruiz", correo: "laura.ruiz@example.com", telefono: "5555123412", comentario: "Comentario 8" },
    { id: 9, nombre: "David", apellido: "Torres", correo: "david.torres@example.com", telefono: "7788990011", comentario: "Comentario 9" },
    { id: 10, nombre: "Gabriel", apellido: "Mike", correo: "gabriel.Mike@example.com", telefono: "323131555", comentario: "Comentario 10" }
  ];
tabla=document.querySelector('#tabla');
function crearTabla(){
    var cadena= "<table>";
    cadena=cadena+"<thead>";
    cadena=cadena+"<tr>";
    cadena=cadena+"<th>ID</th>";
    cadena=cadena+"<th>Nombre</th>";
    cadena=cadena+"<th>Apellido</th>";
    cadena=cadena+"<th>Correo</th>";
    cadena=cadena+"<th>Telefono</th>";
    cadena=cadena+"<th>Comentario</th>";
    cadena=cadena+"</tr>";
    cadena=cadena+"</thead>";
    cadena=cadena+"<tbody>";

    for(const dato of datos){
        cadena=cadena+"<tr>";
        cadena=cadena+"<td>"+ dato.id + "</td>";
        cadena=cadena+"<td>"+ dato.nombre + "</td>";
        cadena=cadena+"<td>"+ dato.apellido + "</td>";
        cadena=cadena+"<td>"+ dato.correo + "</td>";
        cadena=cadena+"<td>"+ dato.telefono + "</td>";
        cadena=cadena+"<td>"+ dato.comentario + "</td>";
        cadena=cadena+"</tr>";

    }
    cadena=cadena+"</tbody>"; 
    cadena=cadena+"</table>";
    tabla.innerHTML=cadena; 

}

function agregarFila(){
    const id =document.getElementById("id").value;
    const nombre =document.getElementById("nombre").value;
    const apellido =document.getElementById("apellido").value;
    const correo =document.getElementById("correo").value;
    const telefono =document.getElementById("telefono").value;
    const comentario =document.getElementById("comentario").value;
    
    if (id&& nombre && apellido && correo && telefono && comentario ){
        body=tabla.getElementsByTagName("tbody")[0];
        const nuevaFila=body.insertRow();
        nuevaFila.innerHTML=`
        <td>${id}</td> 
        <td>${nombre}</td>
        <td>${apellido}</td>
        <td>${correo}</td>
        <td>${telefono}</td>
        <td>${comentario}</td>     
        `;
        document.getElementById("formulario").reset();
        }
        
    else{
        alert("datos incompletos");
    }
}
crearTabla();
