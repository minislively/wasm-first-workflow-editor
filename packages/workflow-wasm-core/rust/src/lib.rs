use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SceneBounds {
    pub min_x: f64,
    pub min_y: f64,
    pub max_x: f64,
    pub max_y: f64,
}

impl SceneBounds {
    pub fn width(self) -> f64 {
        self.max_x - self.min_x
    }

    pub fn height(self) -> f64 {
        self.max_y - self.min_y
    }
}

#[wasm_bindgen]
pub fn wf_clamp_zoom(zoom: f64) -> f64 {
    zoom.clamp(0.45, 2.25)
}

#[wasm_bindgen]
pub fn wf_screen_to_world_x(screen_x: f64, viewport_x: f64, zoom: f64) -> f64 {
    screen_x / zoom + viewport_x
}

#[wasm_bindgen]
pub fn wf_screen_to_world_y(screen_y: f64, viewport_y: f64, zoom: f64) -> f64 {
    screen_y / zoom + viewport_y
}

#[wasm_bindgen]
pub fn wf_pan_viewport_x(viewport_x: f64, delta_x: f64, zoom: f64) -> f64 {
    viewport_x - delta_x / zoom
}

#[wasm_bindgen]
pub fn wf_pan_viewport_y(viewport_y: f64, delta_y: f64, zoom: f64) -> f64 {
    viewport_y - delta_y / zoom
}

#[wasm_bindgen]
pub fn wf_zoom_viewport_x(
    viewport_x: f64,
    current_zoom: f64,
    next_zoom: f64,
    anchor_x: f64,
) -> f64 {
    viewport_x + anchor_x / current_zoom - anchor_x / next_zoom
}

#[wasm_bindgen]
pub fn wf_zoom_viewport_y(
    viewport_y: f64,
    current_zoom: f64,
    next_zoom: f64,
    anchor_y: f64,
) -> f64 {
    viewport_y + anchor_y / current_zoom - anchor_y / next_zoom
}

pub fn compute_bounds(points: &[(f64, f64, f64, f64)]) -> Option<SceneBounds> {
    let first = points.first()?;
    let mut bounds = SceneBounds {
        min_x: first.0,
        min_y: first.1,
        max_x: first.2,
        max_y: first.3,
    };

    for (min_x, min_y, max_x, max_y) in points.iter().copied().skip(1) {
        bounds.min_x = bounds.min_x.min(min_x);
        bounds.min_y = bounds.min_y.min(min_y);
        bounds.max_x = bounds.max_x.max(max_x);
        bounds.max_y = bounds.max_y.max(max_y);
    }

    Some(bounds)
}

#[cfg(test)]
mod tests {
    use super::{
        compute_bounds, wf_clamp_zoom, wf_pan_viewport_x, wf_screen_to_world_x,
        wf_zoom_viewport_x,
    };

    #[test]
    fn clamp_zoom_respects_public_limits() {
        assert_eq!(wf_clamp_zoom(0.2), 0.45);
        assert_eq!(wf_clamp_zoom(1.25), 1.25);
        assert_eq!(wf_clamp_zoom(4.0), 2.25);
    }

    #[test]
    fn compute_bounds_merges_all_rects() {
        let bounds = compute_bounds(&[
            (20.0, 10.0, 120.0, 72.0),
            (-10.0, 40.0, 50.0, 128.0),
            (100.0, -20.0, 180.0, 90.0),
        ])
        .expect("bounds should exist");

        assert_eq!(bounds.min_x, -10.0);
        assert_eq!(bounds.min_y, -20.0);
        assert_eq!(bounds.max_x, 180.0);
        assert_eq!(bounds.max_y, 128.0);
        assert_eq!(bounds.width(), 190.0);
        assert_eq!(bounds.height(), 148.0);
    }

    #[test]
    fn viewport_helpers_match_expected_values() {
        assert_eq!(wf_screen_to_world_x(200.0, -80.0, 1.0), 120.0);
        assert_eq!(wf_pan_viewport_x(-80.0, 40.0, 1.0), -120.0);
        assert_eq!(wf_zoom_viewport_x(-80.0, 1.0, 1.25, 200.0), -40.0);
    }
}
