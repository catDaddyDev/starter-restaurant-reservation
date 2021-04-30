import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { createReservation, readReservation, updateReservation } from '../utils/api';
import ErrorAlert from '../layout/ErrorAlert';

function Form({ type }) {
  const { reservation_id } = useParams();
  const history = useHistory();
  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };
  const [formData, setFormData] = useState({ ...initialState });
  const [reservationsError, setReservationsError] = useState(null);

  const changeHandler = ({ target }) => {
    const input =
      target.type === "number" ? Number(target.value) : target.value;
    setFormData({
      ...formData,
      [target.name]: input,
    });
  };

  useEffect(() => {
    if (type === "Edit") {
      const loadForm = async () => {
        const reservation = await readReservation(reservation_id);
        setFormData({
          ...reservation,
          reservation_date: reservation.reservation_date.slice(0, 10),
        });
      };
      loadForm();
    }
  }, [type, reservation_id]);

  const submitHandler = async (event) => {
    event.preventDefault();
    // only allow reservations to be created on a day when restaurant is open
    let reqDate = new Date(
      `${formData.reservation_date} ${formData.reservation_time}`
    );
    let today = new Date();
    try {
      if (reqDate.getDay() === 2)
        throw new Error("Restaurant is closed on Tuesdays!");
      if (reqDate < today) throw new Error("Cannot book a reservation for a past date.");
      // only allow reservations to be created during business hours, up to 60 minutes before closing
      let time = Number(formData.reservation_time.replace(":", ""));
      if (time < 1030 || time > 2130)
        throw new Error(
          "Reservations can only be set from 10:30 AM to 9:30 PM."
        );
      if (type === "Edit") {
        await updateReservation(reservation_id, { data: formData });
      } else {
        await createReservation({ data: formData });
      }
      setFormData({ ...initialState });
      // window.location.replace(`/dashboard?date=${formData.reservation_date}`);
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      // console.log(error);
      if(error.response) setReservationsError({ message: error.response.data.error })
      if(!error.response)setReservationsError(error);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <h2 className="text-center pb-2">{type} Reservation</h2>
      <form action="" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="first_name" className="form-label">
            First name:
            <input
              className="form-control"
              id="first_name"
              type="text"
              name="first_name"
              onChange={changeHandler}
              value={formData.first_name}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="last_name" className="form-label">
            Last name:
            <input
              className="form-control"
              id="last_name"
              type="text"
              name="last_name"
              onChange={changeHandler}
              value={formData.last_name}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="mobile_number" className="form-label">
            Phone number:
            <input
              className="form-control"
              id="mobile_number"
              type="tel"
              pattern="(1?)\(?([0-9]{3})?\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})"
              name="mobile_number"
              onChange={changeHandler}
              value={formData.mobile_number}
              required
            ></input>
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="reservation_date" className="form-label">
            Date:
            <input
              className="form-control"
              id="reservation_date"
              type="date"
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              name="reservation_date"
              onChange={changeHandler}
              value={formData.reservation_date}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="reservation_time" className="form-label">
            Time:
            <input
              className="form-control"
              id="reservation_time"
              type="time"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              name="reservation_time"
              onChange={changeHandler}
              value={formData.reservation_time}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="people" className="form-label">
            Number of guests:
            <input
              className="form-control"
              id="people"
              type="number"
              min="1"
              max="22"
              name="people"
              onChange={changeHandler}
              value={formData.people}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-sm btn-dark btn-block">Submit</button>
          <button className="btn btn-sm btn-danger btn-block" onClick={() => history.goBack()}>
            Cancel
          </button>
          <button className="btn btn-sm btn-secondary btn-block" onClick={() => setFormData(initialState)}>Reset</button>
        </div>
      </form>
      <ErrorAlert error={reservationsError} />
    </div>
  );
}

export default Form;