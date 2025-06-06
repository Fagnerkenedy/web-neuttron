import axios from "axios";

export function fetchUser() {
  axios.get("http://localhost:3005/fields/read")
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log(err);
    })
}

export function createUserRecord(userRecord) {

  axios.post("http://localhost:3005/fields/create", userRecord)
    .then((response) => {
      userRecord.id = response.data.id;
      fetchUser();
    })
    .catch((err) => {
      debugger;
      console.log(err)
    })

}

export function updateUserRecord(userRecord) {

  const userName = userRecord.data.name;
  const userAge = userRecord.data.age;
  fetch('http://localhost:3005/fields/update/' + userRecord.id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: userName, age: userAge }),
  }).then((response) => {
    fetchUser();
  })

}

export function deleteUser(id) {
  axios.delete("http://localhost:3005/fields/delete/" + id)
    .then((response) => {
     fetchUser()
    })
    .catch((err) => {
      console.log(err)
    })

}

