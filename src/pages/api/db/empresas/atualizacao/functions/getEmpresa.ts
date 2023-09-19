import { GET_Strapi } from "@/pages/api/lib/request_strapi/get";
/**
 * Retrieves the empresa with the specified ID.
 *
 * @param {string} id - The ID of the empresa to retrieve.
 * @return {Promise<any>} - The retrieved empresa object.
 */
export const getEmpresa = async (id: string): Promise<any> => {
  try {
   const url = `/empresas/${id}`;

    const response = await GET_Strapi(url);

    return response;
  } catch (err: any) {
    console.log("🚀 ~ /api/db/empresas/atualizacao/functions/getEmpresa.ts:", err.response?.data);
    return err;
  }
};
