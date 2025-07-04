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
import { ConcretSection, GraphConcretSection, GraphSection } from "./pages/Section/Section";

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
            <Route path="/graph/sections">
              <ProtectedRoute>
                <GraphSection />
              </ProtectedRoute>
            </Route>
            <Route path="/graph/sections/:sectionId">
              {(params) => (<ProtectedRoute>
                <GraphConcretSection sectionId={params.sectionId}/>
              </ProtectedRoute>
            )}
            </Route>

{/* START PUBLIC */}
            <Route path="/public/graph">
              <GraphPublic />
            </Route>
            <Route path="/public/graph/sections">
              <GraphSection isPublic={true}/>
            </Route>
            <Route path="/public/graph/sections/:sectionId">
              {(params) => (
                <GraphSection sectionId={params.sectionId} isPublic={true}/>
            )}
            </Route>
{/* END PUBLIC */}

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
