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
    min: f32,
    max: f32,
    oscs: [f32; 4],
}

#[wasm_bindgen]
impl World {
    #[wasm_bindgen(constructor)]
    pub fn new(scale: usize, min: f32, max: f32) -> World {
        World {
            dot_grid: DotGrid::new(scale),
            min,
            max,
            oscs: [0.; 4],
        }
    }

    pub fn update(&mut self, oscs: Vec<f32>) {
        self.dot_grid.clear();
        let min = self.min;
        let max = self.max;
        let range = max - min;
        oscs.iter()
            .enumerate()
            .for_each(|(i, &osc)| self.oscs[i] = (osc - min) / range);
        let scale = self.dot_grid.scale as f64;
        let mut lines = Vec::new();
        let iters = 50;
        self.oscs.iter().for_each(|&osc| {
            let color = Color::new_from_hsl(osc * 0.8, 1.0, 0.5, 1.0);
            for _ in 0..iters {
                let x1 = (Math::random() - 0.5) as f32;
                let y1 = (Math::random() - 0.5) as f32;
                let z1 = (Math::random() - 0.5) as f32;
                let dir = Vector3::new(x1, y1, z1).normalize();
                lines.push(LineSegment::new(
                    Vector3::new(25., 25., 25.) + dir * osc * 25.,
                    dir,
                    5.,
                    color,
                ));
            }
        });
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
