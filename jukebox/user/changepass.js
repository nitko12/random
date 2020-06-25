const changepass = io("/changepass");

function changePass() {
  changepass.emit(
    "change",
    {
      lastpass: document.getElementById("lastpass").value,
      newpass: document.getElementById("newpass").value
    },
    data => {
      if (data.accepted) alert("Uspješno promjenjena šifra!");
      else alert("Nešto je pošlo po zlu");
    }
  );
}
