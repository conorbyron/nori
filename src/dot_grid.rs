use crate::color::Color;
use nalgebra::Vector3;

pub trait Drawable {
    fn get_instructions(&self) -> Vec<(Vector3<f32>, Color)>;
}

pub struct DotGrid {
    dots: Vec<Color>,
    pub scale: usize,
}
// TODO: Change implementation of scale so that instead of referring to the dimensions of any side of the cube, it is the abs value that each axis extends. ie -scale < x < scale
impl DotGrid {
    pub fn new(scale: usize) -> DotGrid {
        DotGrid {
            dots: vec![Color::new(1.0, 1.0, 1.0, 0.0); scale.pow(3)],
            scale,
        }
    }

    pub fn clear(&mut self) {
        self.dots.iter_mut().for_each(|el| el.a = 0.0);
    }

    pub fn get_dot(&mut self, x: usize, y: usize, z: usize) -> Option<&mut Color> {
        let scale = self.scale;
        let index = x * scale.pow(2) + y * scale + z;
        if index < self.dots.len() {
            Some(&mut self.dots[x * scale.pow(2) + y * scale + z])
        } else {
            None
        }
    }

    fn set_nearest(&mut self, point: Vector3<f32>, color: Color) {
        let x = point.x.round() as usize;
        let y = point.y.round() as usize;
        let z = point.z.round() as usize;
        let scale = self.scale;
        if x < scale && y < scale && z < scale {
            *self.get_dot(x, y, z).unwrap() = color;
        }
    }

    fn set_octet(&mut self, point: Vector3<f32>, color: Color) {
        let scale = self.scale;
        //&mut self.grid[x * scale.pow(2) + y * scale + z]
    }

    pub fn get_ptr(&self) -> (u32, u32) {
        (self.dots.as_ptr() as u32, (self.dots.len() * 4) as u32)
    }

    pub fn draw(&mut self, drawable: &dyn Drawable) {
        drawable
            .get_instructions()
            .iter()
            .for_each(|&(point, color)| self.set_nearest(point, color));
    }
}
