use js_sys::{Error, Float32Array, WebAssembly};
use nalgebra::{Vector3};
use rand::prelude::*;
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
    fn draw(&self) -> Iter<(Vector3<f32>, Color)>;
}

#[derive(Debug, Copy, Clone)]
struct Color {
    r: f32,
    g: f32,
    b: f32,
    a: f32,
}

impl Color {
    pub fn new(r: f32, g: f32, b: f32, a: f32) -> Color {
        Color { r, g, b, a }
    }
}

struct DotGrid {
    dots: Vec<Color>,
    scale: usize,
}

impl DotGrid {
    fn new(scale: usize) -> DotGrid {
        DotGrid {
            dots: vec![Color::new(1.0, 1.0, 1.0, 0.0); scale.pow(3)],
            scale,
        }
    }

    fn clear(&mut self) {
        self.dots.iter_mut().for_each(|el| el.a = 0.0);
    }

    fn get_dot(&mut self, x: usize, y: usize, z: usize) -> &mut Color {
        let scale = self.scale;
        &mut self.dots[x * scale.pow(2) + y * scale + z]
    }

    fn set_nearest(&mut self, point: Vector3<f32>, color: Color) {
        //&mut self.grid[x * scale.pow(2) + y * scale + z]
    }

    fn set_octet(&mut self, point: Vector3<f32>, color: Color) {
        let scale = self.scale;
        //&mut self.grid[x * scale.pow(2) + y * scale + z]
    }
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
        let mut rng = rand::thread_rng();
        let max = self.dot_grid.scale as f32;
        for _ in 0..1000 {
            let x = (rng.gen::<f32>() * max) as usize;
            let y = (rng.gen::<f32>() * max) as usize;
            let z = (rng.gen::<f32>() * max) as usize;
            let color_index = (rng.gen::<f32>() * 4.) as usize;
            let mut color = self.colors[color_index];
            color.a = rng.gen::<f32>() * 0.7;
            let dot = self.dot_grid.get_dot(x, y, z);
            *dot = color;
        }
    }

    pub fn get_buffer(&self) -> Float32Array {
        Float32Array::new_with_byte_offset_and_length(
            &wasm_bindgen::memory()
                .dyn_into::<WebAssembly::Memory>()
                .unwrap()
                .buffer(),
            self.dot_grid.dots.as_ptr() as u32,
            (self.dot_grid.dots.len() * 4) as u32,
        )
    }

    fn draw_continuous(&mut self, x: f32, y: f32, z: f32) {}

    fn draw_discrete(&mut self, x: f32, y: f32, z: f32) {}

    // Maybe I should be implementing these methods on the grid itself? That would make it easier to do borrow splitting.
}
