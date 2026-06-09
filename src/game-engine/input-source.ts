export const InputSource = { 
    Stdin: "stdin", 
    File: "file", 
    Mock: "mock" 
};
export type InputSource = typeof InputSource[keyof typeof InputSource];
