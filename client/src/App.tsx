// Tool Imports
import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { RestaurantsContext, Restaurant } from "./context/RestaurantsContext";
import { UsersContext, User } from "./context/UsersContext";

// Component Imports
import Home from "./routes/Home";
import NoMatch from "./routes/NoMatch";
import UserAuth from "./routes/UserAuth";
import NavBar from "./components/NavBar";
import RestaurantDetail from "./routes/RestaurantDetail";
import UpdateRestaurant from "./routes/UpdateRestaurant";

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<User>({} as User);
  const navigate = useNavigate();

  async function getUser() {
    try {
      const response = await fetch("http://localhost:3000/users/login", {
        credentials: "include",
      });
      const jsonData = await response.json();
      console.log(jsonData.user);
      if (jsonData.isLoggedIn) {
        setUser(jsonData.user);
        navigate("/restaurants");
      } else {
        navigate("/users");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
      } else {
        console.error(err);
      }
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="container min-w-full min-h-full">
      <UsersContext.Provider value={{ user, setUser }}>
        <NavBar />
        <RestaurantsContext.Provider value={{ restaurants, setRestaurants }}>
          <Routes>
            {user.id ? (
              <>
                <Route index element={<Home />} />
                <Route path="/restaurants" element={<Home />} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                <Route
                  path="/restaurants/:id/update"
                  element={<UpdateRestaurant />}
                />
              </>
            ) : (
              <Route path="/users" element={<UserAuth />} />
            )}
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </RestaurantsContext.Provider>
      </UsersContext.Provider>
    </div>
  );
}

export default App;
