import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiClock, FiPower } from 'react-icons/fi';

import { isToday, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/auth';

import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { 
    Container, 
    Header, 
    HeaderContent, 
    Profile,
    Content,
    Schedule,
    Calendar,
    NextAppointment,
    Section,
    Appointment, 
} from './styles';
import api from '../../services/api';

interface IMonthAvailabilityItem {
    day: number;
    available: boolean;
}

interface IAppointment {
    id: string;
    date: string;
    user: {
        name: string;
        avatar_url: string;
    }
}

const Dashboard: React.FC = () => {
    
    const { signOut, user } = useAuth();
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthAvailability, setMonthAvailability] = useState<IMonthAvailabilityItem[]>([]);
    const [appointments, setAppointments] = useState<IAppointment>([]);

    const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
        if(modifiers.available && !modifiers.disabled)
            setSelectedDate(day);
    }, []);

    const handleMonthChange = useCallback((month: Date) => {
        setCurrentMonth(month);
    }, []);

    useEffect(() => {
        api.get(`/providers/${user.id}/month-availability`, {
            params: {
                year: currentMonth.getFullYear(),
                month: currentMonth.getMonth() + 1,
            }
        }).then(response => {
            setMonthAvailability(response.data)
        })
    }, [currentMonth, user.id]);

    useEffect(() => {
        api.get('appointments/me', {
            params: {
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1,
                day: selectedDate.getDate()
            }
        }).then(response => {
            setAppointments(response.data);
        });

        console.log(appointments)
    }, [selectedDate])

    const disabledDays = useMemo(() => {
        const dates = monthAvailability.filter(monthDay => monthDay.available === false)
        .map(monthDay => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), monthDay.day);

            return date;
        });

        return dates;
    }, [currentMonth, monthAvailability]);
    
    const selectedDateAsText = useMemo(() => {
        return format(selectedDate, "dd 'de' MMMM", {
            locale: ptBR
        });
    }, [selectedDate]);

    const selectedWeekDay = useMemo(() => {
        return format(selectedDate, "cccc", {
            locale: ptBR,
        });
    }, [selectedDate]);

    

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <img src={logoImg} alt="logo-go-barber"/>

                    <Profile>
                        <img src={user.avatar_url} alt={user.name}/>

                        <div>
                            <span>Bem vindo</span>
                            <strong>{ user.name }</strong>
                        </div>
                    </Profile>

                    <button type='button' onClick={signOut}> <FiPower /> </button>
                </HeaderContent>
            </Header>

            <Content>
                <Schedule>

                    <h1>Horários agendados</h1>
                    <p>
                        { isToday(selectedDate) && <span>Hoje</span> }
                        <span>{ selectedDateAsText }</span>
                        <span>{ selectedWeekDay }</span>
                    </p>

                    <NextAppointment>

                        <strong>Atendimento a seguir</strong>
                        <div>
                            <img src="https://avatars0.githubusercontent.com/u/68500665?s=460&u=35bbcee8685197fb4677234b41892af476cef24a&v=4" alt=""/>

                            <strong>Whermerson Cavalcante</strong>

                            <span>
                                <FiClock />
                                08:00
                            </span>
                        </div>

                    </NextAppointment>

                    <Section>
                        <strong>Manhã</strong>

                        <Appointment>
                            <span>
                                <FiClock />
                                08: 00
                            </span>

                            <div>
                                <img src="https://avatars0.githubusercontent.com/u/68500665?s=460&u=35bbcee8685197fb4677234b41892af476cef24a&v=4" alt=""/>

                                <strong>Whermerson Cavalcante</strong>
                            </div>
                        </Appointment>
                    </Section>

                    <Section>
                        <strong>Tarde</strong>

                        <Appointment>
                            <span>
                                <FiClock />
                                08: 00
                            </span>

                            <div>
                                <img src="https://avatars0.githubusercontent.com/u/68500665?s=460&u=35bbcee8685197fb4677234b41892af476cef24a&v=4" alt=""/>

                                <strong>Whermerson Cavalcante</strong>
                            </div>
                        </Appointment>
                    </Section>

                </Schedule>

                <Calendar>
                    <DayPicker 
                        fromMonth={new Date()}
                        disabledDays={[{ daysOfWeek: [0,6] }, ...disabledDays]}
                        modifiers={{ available: { daysOfWeek: [1,2,3,4,5] }}} // isso cria uma classe no day picker
                        onDayClick={ handleDateChange }
                        selectedDays={ selectedDate }
                        onMonthChange={ handleMonthChange }
                    />
                </Calendar>
            </Content>
        </Container>
    )
};

export default Dashboard;
