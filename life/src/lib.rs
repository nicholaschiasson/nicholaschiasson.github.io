mod utils;

use fixedbitset::FixedBitSet;
use wasm_bindgen::prelude::wasm_bindgen;

// // A macro to provide `println!(..)`-style syntax for `console.log` logging.
// macro_rules! log {
//     ( $( $t:tt )* ) => {
//         web_sys::console::log_1(&format!( $( $t )* ).into());
//     }
// }

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
    next: FixedBitSet,
    previous: FixedBitSet,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        // let mut count = 0;
        // for delta_row in [self.height - 1, 0, 1] {
        //     for delta_col in [self.width - 1, 0, 1] {
        //         if delta_row == 0 && delta_col == 0 {
        //             continue;
        //         }

        //         let neighbor_row = (row + delta_row) % self.height;
        //         let neighbor_col = (column + delta_col) % self.width;
        //         let idx = self.get_index(neighbor_row, neighbor_col);
        //         count += self.cells[idx] as u8;
        //     }
        // }
        // count

        /*
         * Less elegant but more optimized solution
         */
        let mut count = 0;

        let north = if row == 0 { self.height - 1 } else { row - 1 };

        let south = if row == self.height - 1 { 0 } else { row + 1 };

        let west = if column == 0 {
            self.width - 1
        } else {
            column - 1
        };

        let east = if column == self.width - 1 {
            0
        } else {
            column + 1
        };

        let nw = self.get_index(north, west);
        count += self.cells[nw] as u8;

        let n = self.get_index(north, column);
        count += self.cells[n] as u8;

        let ne = self.get_index(north, east);
        count += self.cells[ne] as u8;

        let w = self.get_index(row, west);
        count += self.cells[w] as u8;

        let e = self.get_index(row, east);
        count += self.cells[e] as u8;

        let sw = self.get_index(south, west);
        count += self.cells[sw] as u8;

        let s = self.get_index(south, column);
        count += self.cells[s] as u8;

        let se = self.get_index(south, east);
        count += self.cells[se] as u8;

        count
    }

    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells.set(idx, true);
        }
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: u32, height: u32) -> Self {
        utils::set_panic_hook();

        let size = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(size);

        for i in 0..size {
            cells.set(i, js_sys::Math::random() < 0.5);
        }

        let capacity = cells.len();

        Self {
            width,
            height,
            cells,
            next: FixedBitSet::with_capacity(capacity),
            previous: FixedBitSet::with_capacity(capacity),
        }
    }

    pub fn tick(&mut self) {
        let mut i = 0;
        for row in 0..self.height {
            for col in 0..self.width {
                self.next.set(
                    i,
                    match (self.cells[i], self.live_neighbor_count(row, col)) {
                        // Any live cell with two or three live neighbors
                        // lives on to the next generaton.
                        (true, 2 | 3) => true,
                        // Any live cell with fewer than two or more than
                        // three live neighbors dies, as if caused by
                        // underpopulation or overpopulation.
                        (true, _) => false,
                        // Any dead cell with exactly three live neighbours
                        // becomes a live cell, as if by reproduction.
                        (false, 3) => true,
                        // All other cells remain in the same state.
                        (otherwise, _) => otherwise,
                    },
                );
                i += 1;
            }
        }

        if self.previous == self.next || self.cells == self.next {
            for _ in 0..self.next.len() / 16 {
                let idx = (js_sys::Math::random() * self.next.len() as f64) as usize;
                self.next.set(idx, true);
            }
        }

        for i in 0..self.next.len() {
            self.previous.set(i, self.cells[i]);
            self.cells.set(i, self.next[i]);
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }
}
