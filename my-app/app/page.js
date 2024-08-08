"use client";

import axios from "axios";
import styles from './page.module.css';
import { useEffect, useState } from "react";

export default function Juego() {
  const [paises, setPaises] = useState([]);
  const [paisAhora, setPaisAhora] = useState(null);
  const [arriesgo, setArriesgo] = useState('');
  const [nombre, setNombre] = useState('');
  const [puntaje, setPuntaje] = useState(0);
  const [tiempo, setTiempo] = useState(15);
  const [ayuda, setAyuda] = useState(false);
  const [tablaPuntaje, setTablaPuntaje] = useState(JSON.parse(localStorage.getItem('tablaPuntaje')) || []);
  const [juegoEmpezado, setJuegoEmpezado] = useState(false);
  const [letras, setLetras] = useState([]);

  useEffect(() => {
    axios.get("https://countriesnow.space/api/v0.1/countries/flag/images")
      .then(response => {
        setPaises(response.data.data);
      });
  }, []);

  useEffect(() => {
    let interval;
    if (paisAhora) {
      interval = setInterval(() => {
        setTiempo((anterior) => anterior - 1);
      }, 1000);
    }

    if (tiempo === 0) {
      ponerOtraBandera(paises);
      setTiempo(15);
    }

    return () => clearInterval(interval);
  }, [paisAhora, tiempo]);

  useEffect(() => {
      localStorage.setItem('tablaPuntaje', JSON.stringify(tablaPuntaje));
  }, [tablaPuntaje]);

  const ponerOtraBandera = (paises) => {
    const random = Math.floor(Math.random() * paises.length);
    setPaisAhora(paises[random]);
    setAyuda(false);
    setLetras([]);
  };

  const actualizarTablaPuntaje = (nuevoPuntaje) => {
    setTablaPuntaje(tablaPuntajeAnterior => {
      const tablaPuntajeActual = [...tablaPuntajeAnterior];
      const jugadorI = tablaPuntajeActual.findIndex(p => p.nombre === nombre);
      if (jugadorI !== -1) {
        tablaPuntajeActual[jugadorI].puntaje = nuevoPuntaje;
      } else {
        tablaPuntajeActual.push({ nombre, puntaje: nuevoPuntaje });
      }
      return tablaPuntajeActual;
    });
  };

  const verSiEsCorrecto = () => {
    let nuevoPuntaje;
    if (arriesgo.toLowerCase() === paisAhora.name.toLowerCase()) {
      nuevoPuntaje = puntaje + 10 + tiempo;
      ponerOtraBandera(paises);
      setTiempo(15);
    } else {
      nuevoPuntaje = puntaje - 1;
    }
    setPuntaje(nuevoPuntaje);
    actualizarTablaPuntaje(nuevoPuntaje);
    setArriesgo('');
  };

  const setearAyuda = () => {
    if (tiempo > 2 && paisAhora) {
      const nombrePais = paisAhora.name.toLowerCase();
      let nuevasLetras = [...letras];
      let random;
      if (nuevasLetras.includes(random)){
        random = Math.floor(Math.random() * nombrePais.length);
      }

      nuevasLetras.push(random);
      setLetras(nuevasLetras);
      setTiempo((anterior) => Math.max(anterior - 2, 0));
      setAyuda(true);
    }
  };

  const getAyuda = () => {
    if (paisAhora) {
      const nombrePais = paisAhora.name.toLowerCase();
      return nombrePais
        .split('')
        .map((l, index) => (letras.includes(index) ? l : '_'))
        .join(' ');
    }
    return '';
  };

  const empezarJuego = () => {
    setJuegoEmpezado(true);
    ponerOtraBandera(paises);
    actualizarTablaPuntaje(0);
  };

  return (
    <div className={styles.container}>
  <h1 className={styles.h1}>Banderas</h1>
  {!juegoEmpezado ? (
    <div>
      <input className={styles.input}
        type="text"
        placeholder="Ingrese su nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button className={styles.button} onClick={empezarJuego} disabled={!nombre}>Empezar</button>
    </div>
  ) 
  : 
  (
    <div className={styles.game}>
      {paisAhora && (
        <>
          <img className={styles.img} src={paisAhora.flag} />
          <div className={styles['game-content']}>
            <input className={styles.input}
              type="text"
              value={arriesgo}
              onChange={(e) => setArriesgo(e.target.value)}
              placeholder="Adivina el país"
            />
            <button className={styles.button} onClick={verSiEsCorrecto}>Arriesgar</button>
            <p className={styles.texto}>Ayuda: {getAyuda()}</p>
            <div className={styles.info}>
              <p>Puntaje: {puntaje}</p>
              <p>Tiempo: {tiempo}s</p>
              <button className={styles.button} onClick={setearAyuda}>Ayuda</button>
            </div>
          </div>
        </>
      )}
    </div>
  )}
  <div className={styles.tablaPuntaje}>
    <h2>Tabla de puntajes</h2>
    <ul>
      {tablaPuntaje.map((p, index) => (
        <li className={styles.texto} key={index}>{p.nombre}: {p.puntaje} puntos</li>
      ))}
    </ul>
  </div>
</div>
  );
}
