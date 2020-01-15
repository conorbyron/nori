mod color;
mod dot_grid;

use crate::color::Color;
use crate::dot_grid::DotGrid;
use js_sys::{Error, Float32Array, Math, WebAssembly};
use nalgebra::Vector3;
use std::slice::Iter;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
//use web_sys::console;

/*
It would be very convenient to be able to change the scale in js without it affecting anything on this side of the code.
This would make it difficult, however, to create animations that happen specifically in one point, line or plane.
Perhaps the scale parameter could be used to scale these animations also, rather than just the size of the world.
*/

trait Drawable {
    fn get_instructions(&self) -> Iter<(Vector3<f32>, Color)>;
}

#[wasm_bindgen]
pub struct World {
    dot_grid: DotGrid,
    colors: Vec<Color>,
}

#[wasm_bindgen]
impl World {
    #[wasm_bindgen(constructor)]
    pub fn new(scale: usize) -> World {
        let colors = vec![
            Color::new(5. / 255., 182. / 255., 145. / 255., 1.0),
            Color::new(36. / 255., 182. / 255., 1., 1.0),
            Color::new(239. / 255., 150. / 255., 219. / 255., 1.0),
            Color::new(187. / 255., 160. / 255., 244. / 255., 1.0),
        ];
        World {
            dot_grid: DotGrid::new(scale),
            colors,
        }
    }

    pub fn update(&mut self) {
        //self.dot_grid.clear();
        let max = self.dot_grid.scale as f64;
        for _ in 0..1000 {
            let x = (Math::random() * max) as usize;
            let y = (Math::random() * max) as usize;
            let z = (Math::random() * max) as usize;
            let color_index = (Math::random() * 4.) as usize;
            let mut color = self.colors[color_index];
            color.a = (Math::random() * 0.7) as f32;
            let dot = self.dot_grid.get_dot(x, y, z);
            *dot = color;
        }
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
