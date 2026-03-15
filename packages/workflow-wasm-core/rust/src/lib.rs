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

#[unsafe(no_mangle)]
pub extern "C" fn wf_clamp_zoom(zoom: f64) -> f64 {
    zoom.clamp(0.45, 2.25)
}

#[unsafe(no_mangle)]
pub extern "C" fn wf_bounds_width(min_x: f64, max_x: f64) -> f64 {
    max_x - min_x
}

#[unsafe(no_mangle)]
pub extern "C" fn wf_bounds_height(min_y: f64, max_y: f64) -> f64 {
    max_y - min_y
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
    use super::{compute_bounds, wf_bounds_height, wf_bounds_width, wf_clamp_zoom};

    #[test]
    fn clamp_zoom_respects_public_limits() {
        assert_eq!(wf_clamp_zoom(0.2), 0.45);
        assert_eq!(wf_clamp_zoom(1.25), 1.25);
        assert_eq!(wf_clamp_zoom(4.0), 2.25);
    }

    #[test]
    fn bounds_math_matches_expected_dimensions() {
        assert_eq!(wf_bounds_width(-20.0, 80.0), 100.0);
        assert_eq!(wf_bounds_height(12.0, 54.0), 42.0);
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
}
