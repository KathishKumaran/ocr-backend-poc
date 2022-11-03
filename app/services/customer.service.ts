import { Customer } from "../models";
import { CustomerAttributes, CustomerInstance } from "../types/customer";
import {
  CustomerListQueryParams,
  CustomerRowsAndCount,
} from "../types/customers.controllers";
import { map, size } from "lodash";
import { paginate, paginatorResult } from "../lib/paginator-result";
import { Q_MINIMUM_SIZE } from "../config/constants";
import globalSearchQuery from "../queries/customer-global-search-query";
import columnSearchQuery from "../queries/customer-column-search.query";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
const fs = require("fs");

async function create(attrs: CustomerAttributes) {
  return await Customer.create(attrs);
}

function filterAndPaginate(query: CustomerListQueryParams) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const perPage = query.per_page && query.per_page > 0 ? query.per_page : 10;
  const offset = (page - 1) * perPage;
  const limit = perPage;
  const queries =
    size(query.q) >= Q_MINIMUM_SIZE ? globalSearchQuery(query) : {};
  const columnQueries = columnSearchQuery(query);
  return Customer.findAndCountAll({
    limit,
    offset,
    where: { ...queries, ...columnQueries },
    order: [["id", "DESC"]],
  }).then((customers: CustomerRowsAndCount) => {
    const customersList = map(customers.rows, (row: CustomerInstance) => ({
      id: row.id,
      name: row.name,
      door_no: row.door_no,
      address: row.address,
      city: row.city,
      pincode: row.pin_code,
      taluk: row.taluk,
      district: row.district,
      mobile: row.mobile,
      landline: row.landline,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
    const rowsAndCounts = { count: customers.count, rows: customersList };
    const result = paginate(rowsAndCounts, perPage, page);
    return paginatorResult(result, "customers");
  });
}

async function savePdf(base64: string) {
  const parser = new XMLParser();
  const fileName = `${new Date().getTime()}.pdf`;
  const filePath = `/root/ocr/assets/${fileName}`;
  //const filePath = `/app/app/assets/${fileName}`;
  // const base64 = (await (await file).toBuffer()).toString("base64");
  var buf = Buffer.from(base64, "base64");
  // console.log(fs.createReadStream(filePath));
  fs.writeFile(filePath, buf, (error: any) => {
    if (error) {
      throw error;
    } else {
      console.log("buffer saved!");
    }
  });
  const data = await axios.request({
    method: "POST",
    url: "https://ocrapi.visive.ai",
    data: {
      file: fs.createReadStream(filePath),
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return parser.parse(data.data);
}

export { create, filterAndPaginate, savePdf };
