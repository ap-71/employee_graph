import { Route, Switch } from "wouter";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Management from "./pages/Management";
import { Graph, GraphPublic } from "./pages/Graph";
import { ConcretSection } from "./pages/Section/Section";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Layout>
          <Switch>
            <Route path="/login">
              <PublicRoute>
                <Login />
              </PublicRoute>
            </Route>
            <Route path="/register">
              <PublicRoute>
                <Register />
              </PublicRoute>
            </Route>
            <Route path="/graph">
              <ProtectedRoute>
                <Graph />
              </ProtectedRoute>
            </Route>
            <Route path="/public/graph">
              <GraphPublic />
            </Route>
            <Route path="/management">
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            </Route>
            <Route path="/management/sections/:name_or_id">
              {(params) => (
                <ProtectedRoute>
                  <ConcretSection sectionId={params.name_or_id} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/">
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Route>
          </Switch>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
