const { Server } = require("socket.io");

let io;
const connectedMasters = new Map();
const connectedCustomers = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("registerMaster", ({ categoryIds, cityId }) => {
      connectedMasters.set(socket.id, { categoryIds, cityId });
      console.log(`Usta qoşuldu: socketId=${socket.id}, şəhər ID=${cityId}, kateqoriyalar=${categoryIds.join(',')}`);
    });

    socket.on("registerCustomer", ({ customerId }) => {
      connectedCustomers.set(socket.id, { customerId });
      console.log(`Müştəri qoşuldu: socketId=${socket.id}, müştəri ID=${customerId}`);
    });

    socket.on("disconnect", () => {
      const master = connectedMasters.get(socket.id);
      if (master) {
        console.log(`Usta bağlantısı kəsildi: socketId=${socket.id}, şəhər ID=${master.cityId}, kateqoriyalar=${master.categoryIds.join(',')}`);
        connectedMasters.delete(socket.id);
        return;
      }
      
      const customer = connectedCustomers.get(socket.id);
      if (customer) {
        console.log(`Müştəri bağlantısı kəsildi: socketId=${socket.id}, müştəri ID=${customer.customerId}`);
        connectedCustomers.delete(socket.id);
        return;
      }
      
      console.log(`Bilinməyən bağlantı kəsildi: socketId=${socket.id}`);
    });
  });
}

async function notifyMatchingUstas(jobId) {
  try {
    const Job = require('../models/job.model');
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      console.error(`Job #${jobId} bildirim göndermek için bulunamadı`);
      return;
    }
    
    for (const [socketId, master] of connectedMasters.entries()) {
      if (
        master.cityId == job.city_id && 
        master.categoryIds.includes(job.category_id)
      ) {
        io.to(socketId).emit("newJob", {
          jobId: job.id,
          title: job.title,
          description: job.description,
          city: job.city_name,
          category: job.category_name
        });
        console.log(`Usta bildirim gönderildi: socketId=${socketId}, jobId=${job.id}`);
      }
    }
  } catch (error) {
    console.error('Usta bildirim hatası:', error);
  }
}

async function notifyCustomerForProposal(proposalId) {
  try {
    const Proposal = require('../models/proposal.model');
    const Job = require('../models/job.model');
    
    const proposal = await Proposal.findById(proposalId);
    
    if (!proposal) {
      console.error(`Teklif #${proposalId} bildirim göndermek için bulunamadı`);
      return;
    }
    
    const job = await Job.findById(proposal.job_id);
    
    if (!job) {
      console.error(`Job #${proposal.job_id} bildirim göndermek için bulunamadı`);
      return;
    }
    
    for (const [socketId, customer] of connectedCustomers.entries()) {
      if (customer.customerId == job.customer_id) {
        io.to(socketId).emit("newProposal", {
          proposalId: proposal.id,
          jobId: job.id,
          jobTitle: job.title,
          masterName: proposal.master_name,
          price: proposal.price,
          message: proposal.message
        });
        console.log(`Müştəri bildirim gönderildi: socketId=${socketId}, müştəri ID=${customer.customerId}, teklif ID=${proposal.id}`);
      }
    }
  } catch (error) {
    console.error('Müştəri teklif bildirimi hatası:', error);
  }
}

module.exports = {
  initSocket,
  notifyMatchingUstas,
  notifyCustomerForProposal
};