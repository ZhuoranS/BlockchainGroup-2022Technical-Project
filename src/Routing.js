import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// pages, components, styles
import Nav from "./components/Nav";
import Container from "./styles/Container";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import DetailedPost from "./pages/DetailedPost";
import EditProfile from "./pages/EditProfile";

const Routing = () => {
  return (
    <Router>
      <Nav />
      <Container>
        <Switch>
          <Route path="/explore" component={Explore} />
          <Route path="/p/:postAddress" component={DetailedPost} />
          <Route path="/accounts/edit" component={EditProfile} />
          <Route path="/:address" component={Profile} />
        </Switch>
      </Container>
    </Router>
  );
};

export default Routing;
