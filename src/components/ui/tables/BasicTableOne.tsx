'use client'
import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../table";
import Link from "next/link";
import Button from "../button/Button";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";

type Patient = {
  patientId: string;
  name: string;
  age: number;
  code: string;
  work: string;
};

type Props = {
  tabledata: Patient[];
};

const BasicTableOne: React.FC<Props> = ({ tabledata }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemOffset, setItemOffset] = useState(0); 
  const itemsPerPage = 15;
  const router = useRouter();

  // 1. Filtering logic for search
  const filteredData = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return tabledata.filter(
      (patient) =>
        patient.name.toLowerCase().includes(lowercasedSearchTerm) ||
        patient.code.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, tabledata]);

  // 2. Pagination Logic
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredData.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  // 3. Handle Page Change (updates local offset)
  const handlePageChange = ({ selected }: { selected: number }) => {
    const newOffset = (selected * itemsPerPage) % filteredData.length;
    setItemOffset(newOffset);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/profile/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 justify-between">
        <div>
          <input
            type="text"
            placeholder="Search by name or code..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setItemOffset(0); // Reset to first page on search
            }}
          />
        </div>

        <Link href="/dashboard/patients/addPatients">
          <Button className="my-5">
            Add Patient +
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Patients
            </h3>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table className="table-fixed ">
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Patient
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 px-10 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Code
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 px-10 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-lg">
              {currentItems.length > 0 ? (
                currentItems.map((patient) => (
                  <TableRow key={patient.patientId}>
                    <TableCell className="py-3" >
                      <div className="flex items-center gap-3">
                        <div className="min-h-[30px] min-w-[30px] overflow-hidden rounded-md">
                          <img
                            src='/images/user-avatar.png'
                            className="h-[30px] w-[30px]"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {patient.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-10 py-4 sm:px-6 text-start">
                      <span className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 ">
                        {patient.code}
                      </span>
                    </TableCell>
                    <TableCell className="px-10 py-4 sm:px-6 text-start">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEdit(patient.patientId)} 
                          className="px-3 py-1.5 text-xs font-medium"
                        >
                          Edit
                        </Button>

                        <Button 
                          onClick={() => handleDelete(patient.patientId)} 
                          className="bg-red-700 px-3 py-1.5 text-xs font-medium hover:bg-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No results found
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          breakLabel="..."
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName="flex gap-2 items-center"
          pageClassName="border rounded-lg cursor-pointer hover:bg-gray-200 overflow-hidden"
          pageLinkClassName="px-4 py-2 block w-full h-full"
          previousClassName="border rounded-lg cursor-pointer hover:bg-gray-200 overflow-hidden"
          previousLinkClassName="px-4 py-2 block w-full h-full"
          nextClassName="border rounded-lg cursor-pointer hover:bg-gray-200 overflow-hidden"
          nextLinkClassName="px-4 py-2 block w-full h-full"
          breakClassName="px-4 py-2"
          activeClassName="bg-brand-500 text-white"
          disabledClassName="opacity-50 cursor-not-allowed"
        />
      </div>
    </>
  );
};

export default BasicTableOne;