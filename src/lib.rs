mod color;
mod dot_grid;

use crate::color::Color;
use crate::dot_grid::{DotGrid, Drawable};
use js_sys::{Float32Array, Math, WebAssembly};
use nalgebra::{Unit, Vector3};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
//use web_sys::console;

// TODO: Import/integrate/implement ways of controlling the timing of animations more precisely. Strive for continuity in animations.

// TODO: NEW SHAPES: Rectangle, Circle, Cylinder, Cone, Box, Sphere

struct LineSegment {
    origin: Vector3<f32>,
    direction: Unit<Vector3<f32>>,
    length: f32,
    color: Color,
}

impl LineSegment {
    pub fn new(
        origin: Vector3<f32>,
        direction: Vector3<f32>,
        length: f32,
        color: Color,
    ) -> LineSegment {
        LineSegment {
            origin,
            direction: Unit::new_normalize(direction),
            length,
            color,
        }
    }
}

impl Drawable for LineSegment {
    fn get_instructions(&self) -> Vec<(Vector3<f32>, Color)> {
        let mut instructions = Vec::new();
        let num_points = self.length.ceil();
        let point_dist = num_points / self.length;
        for i in 0..num_points as usize {
            instructions.push((
                self.origin + i as f32 * point_dist * self.direction.as_ref(),
                self.color,
            ));
        }
        instructions
    }
}

#[wasm_bindgen]
pub struct World {
    dot_grid: DotGrid,
}

#[wasm_bindgen]
impl World {
    #[wasm_bindgen(constructor)]
    pub fn new(scale: usize) -> World {
        World {
            dot_grid: DotGrid::new(scale),
        }
    }

    pub fn update(&mut self) {
        self.dot_grid.clear();
        let scale = self.dot_grid.scale as f64;
        let mut lines = Vec::new();
        for _ in 0..500 {
            let x0 = (Math::random() * scale) as f32;
            let y0 = (Math::random() * scale) as f32;
            let z0 = (Math::random() * scale) as f32;
            let x1 = (Math::random() - 0.5) as f32;
            let y1 = (Math::random() - 0.5) as f32;
            let z1 = (Math::random() - 0.5) as f32;
            lines.push(LineSegment::new(
                Vector3::new(x0, y0, z0),
                Vector3::new(x1, y1, z1),
                10.,
                Color::new(
                    Math::random() as f32,
                    Math::random() as f32,
                    Math::random() as f32,
                    1.0,
                ),
            ));
        }
        let dot_grid = &mut self.dot_grid;
        lines.iter().for_each(|line| dot_grid.draw(line));
    }

    pub fn get_buffer(&self) -> Float32Array {
        let (ptr, len) = self.dot_grid.get_ptr();
        Float32Array::new_with_byte_offset_and_length(
            &wasm_bindgen::memory()
                .dyn_into::<WebAssembly::Memory>()
                .unwrap()
                .buffer(),
            ptr,
            len,
        )
    }
}
