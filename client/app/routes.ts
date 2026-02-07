import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("/control", "routes/control.tsx"),
    route("/schedule/*", "routes/schedule.tsx"),
    route("/weather", "routes/weather.tsx", [
      route("wind", "routes/weather.wind.tsx"),
      route("baro", "routes/weather.baro.tsx"),
      route("rain", "routes/weather.rain.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
