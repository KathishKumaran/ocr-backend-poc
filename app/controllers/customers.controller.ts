import { FastifyReply, FastifyRequest, FastifyError } from "fastify";
import { CustomerAttributes } from "../types/customer";
import {
  create,
  filterAndPaginate,
  savePdf,
} from "../services/customer.service";
import { CustomerListQueryParams } from "../types/customers.controllers";
import logger from "../config/logger";

function createCustomer(req: FastifyRequest, reply: FastifyReply) {
  const attrs = req.body as CustomerAttributes;
  return create(attrs)
    .then((customer: any) => {
      reply.status(200).send(customer);
    })
    .catch((err: Error) => {
      reply.status(400).send({ errors: err.message });
    });
}

function list(req: FastifyRequest, reply: FastifyReply) {
  const query = req.query as CustomerListQueryParams;
  filterAndPaginate(query)
    .then((customers) => {
      reply.code(200).send(customers);
    })
    .catch((error: FastifyError) => {
      reply.send(error);
    });
}

async function pdf(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { base64 } = req.body as { base64: string };
    console.log("-------------------base64", base64);

    savePdf(base64)
      .then((base64) => {
        reply.code(200).send(base64);
      })
      .catch((error) => {
        reply.code(403).send(error);
      });
  } catch (error) {
    console.log("--------------catch", error);
  }
}

export { createCustomer, list, pdf };
