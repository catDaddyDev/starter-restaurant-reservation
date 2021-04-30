import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import Reservation from "../dashboard/Reservation";
import { listTables, updateTable, readReservation } from "../utils/api";

function SeatReservation() {
  const [formData, setFormData] = useState("Please select a table.");
  const [tables, setTables] = useState([]);
  const [reservation, setReservation] = useState([]);

  const [tablesError, setTablesError] = useState(null);
  const [reservationError, setReservationError] = useState(null);

  const history = useHistory();
  const { reservation_id } = useParams();

  useEffect(() => {
    async function loadReservations() {
      const abortController = new AbortController();
      setTablesError(null);
      setReservationError(null);
      try {
        const tables = await listTables(abortController.signal);
        setTables(tables);
        const reserved = await readReservation(reservation_id);
        setReservation(reserved);
      } catch (error) {
        setTablesError({ message: error.response.data.error });
        setReservationError({ message: error.response.data.error });
      }
      return () => abortController.abort();
    }
    loadReservations();
  }, [reservation_id]);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      if (formData === "Please select a table.")
        throw new Error("Please select a valid table.");
      await updateTable(formData, { data: { reservation_id } });
      history.push("/dashboard");
    } catch (error) {
      if (error.response)
        setTablesError({ message: error.response.data.error });
        if(!error.response) setTablesError(error)
    }
  };
  const changeHandler = ({ target }) => {
    setFormData(target.value);
  };
  const cancelHandler = () => {
    setFormData("Please select a table.");
    history.goBack();
  };

  return (
    <>
      <div className="d-flex flex-column align-items-center justify-content-center mt-5">
        <form
          action=""
          onSubmit={submitHandler}
          className="d-flex flex-column justify-content-center"
        >
          <label htmlFor="table_id">
            <select
              id="table_id"
              name="table_id"
              onChange={changeHandler}
              value={formData}
            >
              <option>Please Select a table</option>
              {tables.map((table) => {
                return (
                  <option key={table.table_id} value={table.table_id}>
                    {table.table_name} - {table.capacity}
                  </option>
                );
              })}
            </select>
          </label>
          <button type="submit" className="btn btn-sm btn-primary">
            Submit
          </button>
        </form>
        <button
          onClick={cancelHandler}
          className="mb-5 mt-2 btn btn-sm btn-danger"
        >
          Cancel
        </button>
        {reservation.reservation_time && (
          <Reservation reservation={reservation} type="seating" />
        )}
        <ErrorAlert error={tablesError} />
        <ErrorAlert error={reservationError} />
      </div>
    </>
  );
}

export default SeatReservation;