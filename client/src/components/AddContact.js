import React from "react";
import Form from "react-bootstrap/Form";

class AddContact extends React.Component {
  state = {
    name: "",
    email: "",
  };

  add = (e) => {
    e.preventDefault();
    if (this.state.name === "" || this.state.email === "") {
      alert("All the feilds are mandatory!");
      return;
    } else {
      console.log(this.state.name);
      this.props.addContactHandler(this.state);
      this.setState({ name: "", email: "" });
    } //to clearing feilds after submit
  };

  render() {
    return (
      <div className="ui main">
        <h2>Add Contact</h2>
        <Form>
          <Form.Group className="mb-3" controlId="formGrouptext">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Name"
              value={this.state.name}
              onChange={(e) => this.setState({ name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formGroupEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Enter email"
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
            />
          </Form.Group>

          <button className="primary">Add</button>
        </Form>
      </div>
    );
  }
}

export default AddContact;
