import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import propTypes from "react-bootstrap/esm/Image";

export default function MyNavbar(props) {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">{props.title}</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Signed in as: <a href="#login">{props.user}</a>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

MyNavbar.propTypes = {
  title: propTypes.string,
  user: propTypes.char,
};
