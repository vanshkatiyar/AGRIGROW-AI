const Service = require('../models/Service');

const serviceSocketHandler = (io) => {
  const serviceChangeStream = Service.watch();

  serviceChangeStream.on('change', (change) => {
    switch (change.operationType) {
      case 'insert':
        io.emit('serviceCreated', change.fullDocument);
        break;
      case 'update':
        io.emit('serviceUpdated', change.updateDescription.updatedFields);
        break;
      case 'delete':
        io.emit('serviceDeleted', change.documentKey._id);
        break;
    }
  });
};

module.exports = serviceSocketHandler;