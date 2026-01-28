import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parseISO, differenceInDays, addDays, formatISO } from "date-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const authToken = process.env.ATORIZZATION_TOKEN;

    if (!strapiUrl || !authToken) {
      return res
        .status(500)
        .json({ error: "Missing API URL or authorization token" });
    }

    // Step 1: Get page and pageSize from request body for batching
    const page = parseInt(req.body.page as string) || 1;
    const pageSize = parseInt(req.body.pageSize as string) || 50;
    const processAll = req.body.processAll === true;

    let allCompanies: any[] = [];
    let pagination: any = null;

    if (processAll) {
      // Old behavior: fetch all (risky for timeouts)
      let currentPage = 1;
      let hasMore = true;
      while (hasMore) {
        const companiesResponse = await axios.get(
          `${strapiUrl}/empresas?pagination[page]=${currentPage}&pagination[pageSize]=100&fields[0]=id&fields[1]=nome`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const companies = companiesResponse.data?.data || [];
        allCompanies = [...allCompanies, ...companies];
        const pg = companiesResponse.data?.meta?.pagination;
        hasMore = pg && currentPage < pg.pageCount;
        currentPage++;
      }
    } else {
      // Batch behavior: fetch only one page
      const companiesResponse = await axios.get(
        `${strapiUrl}/empresas?pagination[page]=${page}&pagination[pageSize]=${pageSize}&fields[0]=id&fields[1]=nome`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      allCompanies = companiesResponse.data?.data || [];
      pagination = companiesResponse.data?.meta?.pagination;
    }

    console.log(
      `📊 Processing batch: ${page}. Companies in batch: ${allCompanies.length}`,
    );

    const results = {
      processed: 0,
      updated: 0,
      errors: [] as any[],
      details: [] as any[],
    };

    // Process each company
    for (const empresa of allCompanies) {
      try {
        const empresaId = empresa.id;
        const empresaNome = empresa.attributes?.nome || empresaId;

        // Step 2: Get the last 5 won businesses (or as many as available)
        // Fetch businesses for this company with filters for won businesses
        const businessesResponse = await axios.get(
          `${strapiUrl}/businesses?filters[empresa][id][$eq]=${empresaId}&filters[etapa][$eq]=6&filters[andamento][$eq]=5&filters[date_conclucao][$notNull]=true&sort[0]=date_conclucao:desc&pagination[limit]=5&fields[0]=date_conclucao`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        const businesses = businessesResponse.data?.data || [];

        // Filter and map won businesses with valid dates
        const wonBusinesses = businesses
          .filter((b: any) => {
            const dateConclucao =
              b.attributes?.date_conclucao || b.date_conclucao;
            return dateConclucao && dateConclucao.trim() !== "";
          })
          .map((b: any) => {
            const dateConclucao =
              b.attributes?.date_conclucao || b.date_conclucao;
            return {
              date: parseISO(dateConclucao),
              dateString: dateConclucao,
            };
          })
          .sort((a: any, b: any) => b.date.getTime() - a.date.getTime()); // Most recent first

        results.processed++;

        // Step 3: Calculate average days between businesses
        let averageDays: number | null = null;
        let lastBusinessDate: Date | null = null;

        if (wonBusinesses.length >= 2) {
          // Calculate differences between consecutive businesses
          const differences: number[] = [];
          for (let i = 0; i < wonBusinesses.length - 1; i++) {
            const diff = differenceInDays(
              wonBusinesses[i].date,
              wonBusinesses[i + 1].date,
            );
            if (diff >= 0) {
              differences.push(diff);
            }
          }

          if (differences.length > 0) {
            const sum = differences.reduce(
              (acc: number, val: number) => acc + val,
              0,
            );
            averageDays = sum / differences.length;
          }
        }

        // Get the most recent business date
        if (wonBusinesses.length > 0) {
          lastBusinessDate = wonBusinesses[0].date;
        }

        // Step 4-6: Determine purchaseFrequency and expiresIn based on average
        let purchaseFrequency: string;
        let expiresIn: string;
        const currentDate = new Date();

        if (averageDays === null || averageDays > 180) {
          // Raramente: expiresIn = 365 days after last business or current date
          purchaseFrequency = "Raramente";
          const baseDate = lastBusinessDate || currentDate;
          expiresIn = formatISO(addDays(baseDate, 365), {
            representation: "date",
          });
        } else if (averageDays >= 40 && averageDays <= 180) {
          // Eventualmente: expiresIn = 200 days after last business or current date
          purchaseFrequency = "Eventualmente";
          const baseDate = lastBusinessDate || currentDate;
          expiresIn = formatISO(addDays(baseDate, 200), {
            representation: "date",
          });
        } else {
          // Mensalmente: expiresIn = 40 days after last business or current date
          purchaseFrequency = "Mensalmente";
          const baseDate = lastBusinessDate || currentDate;
          expiresIn = formatISO(addDays(baseDate, 40), {
            representation: "date",
          });
        }

        // Update the company
        await axios.put(
          `${strapiUrl}/empresas/${empresaId}`,
          {
            data: {
              purchaseFrequency,
              expiresIn,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        results.updated++;
        results.details.push({
          empresaId,
          empresaNome,
          wonBusinessesCount: wonBusinesses.length,
          averageDays:
            averageDays !== null ? Math.round(averageDays * 100) / 100 : null,
          purchaseFrequency,
          expiresIn,
          lastBusinessDate: lastBusinessDate
            ? formatISO(lastBusinessDate, { representation: "date" })
            : null,
        });

        console.log(
          `✓ Updated ${empresaNome}: ${purchaseFrequency} (avg: ${averageDays !== null ? averageDays.toFixed(2) : "N/A"} days)`,
        );
      } catch (error: any) {
        const empresaId = empresa.id;
        const empresaNome = empresa.attributes?.nome || empresaId;
        const errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          "Unknown error";

        results.errors.push({
          empresaId,
          empresaNome,
          error: errorMessage,
        });

        console.error(`✗ Error processing ${empresaNome}:`, errorMessage);
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalCompanies: pagination?.total || allCompanies.length,
        processed: results.processed,
        updated: results.updated,
        errors: results.errors.length,
      },
      pagination,
      details: results.details,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error("Error refactoring purchase frequency:", error);
    return res.status(500).json({
      error: "Failed to refactor purchase frequency",
      details: error.response?.data || error.message,
    });
  }
}
