export const readJsonFile = (fileContent: string): any => {
  try {
    const data = JSON.parse(fileContent);
    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid JSON file');
    }
    throw new Error('Failed to read file');
  }
};
