// Mock data, again we didnt have time to make a real database lmaooo
let examples = [
  { id: 1, name: "Example 1", description: "This is example 1" },
  { id: 2, name: "Example 2", description: "This is example 2" },
];

// GET all examples
exports.getAllExamples = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: examples,
      count: examples.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET example by ID
exports.getExampleById = (req, res) => {
  try {
    const { id } = req.params;
    const example = examples.find((e) => e.id === parseInt(id));

    if (!example) {
      return res.status(404).json({
        success: false,
        error: "Example not found",
      });
    }

    res.status(200).json({
      success: true,
      data: example,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// CREATE new example
exports.createExample = (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: "Name and description are required",
      });
    }

    const newExample = {
      id: examples.length > 0 ? Math.max(...examples.map((e) => e.id)) + 1 : 1,
      name,
      description,
      createdAt: new Date(),
    };

    examples.push(newExample);

    res.status(201).json({
      success: true,
      message: "Example created successfully",
      data: newExample,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// UPDATE example
exports.updateExample = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const example = examples.find((e) => e.id === parseInt(id));

    if (!example) {
      return res.status(404).json({
        success: false,
        error: "Example not found",
      });
    }

    if (name) example.name = name;
    if (description) example.description = description;
    example.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: "Example updated successfully",
      data: example,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE example
exports.deleteExample = (req, res) => {
  try {
    const { id } = req.params;

    const exampleIndex = examples.findIndex((e) => e.id === parseInt(id));

    if (exampleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Example not found",
      });
    }

    const deletedExample = examples.splice(exampleIndex, 1);

    res.status(200).json({
      success: true,
      message: "Example deleted successfully",
      data: deletedExample[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
