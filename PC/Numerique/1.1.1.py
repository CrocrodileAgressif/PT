import matplotlib.pyplot as plt
import numpy as np

# ----------------

fe = 1e3  # fréquence du signal d’entrée en Hz
E = 1.  # amplitude du signal créneau
moyenne = 1.  # moyenne du signal créneau

fe2 = 2e3  # fréquence du signal d’entrée en Hz
E2 = .5  # amplitude du signal créneau
moyenne2 = .75  # moyenne du signal créneau


nmax = 50  # Nombre d’harmoniques prises en compte

# -----------------------------------------
# A. Synthèse spectrale du signal d’entrée - Tracé de e(t)
# -----------------------------------------

cn = []  # Définit la liste des coefficients de Fourier
phin = []  # phases

cn2 = []  # Définit la liste des coefficients de Fourier
phin2 = []  # phases


for i in range(nmax):
    cn.append(4*E/((2*i+1)*np.pi))  # Amplitudes des différentes harmoniques
    phin.append(-np.pi/2)  # A compléter

    cn2.append(-8*E2/(((2*i+1)*np.pi)**2))  # Amplitudes des différentes harmoniques
    phin2.append(0.)  # A compléter

# Tracé de la fonction e(t) à partir de la DSF - Représentation temporelle -

def e(t):
    val = moyenne  # Valeur moyenne
    for n in range(0, len(cn)):
        #val += cn[n] * np.cos(2*np.pi*n*fe*t+phin[n])
        val += cn[n] * np.cos(2*np.pi*(2*n+1)*fe*t+phin[n])
    return val

def e2(t):
    val = moyenne2  # Valeur moyenne
    for n in range(0, len(cn2)):
        val += cn2[n] * np.cos(2*np.pi*(2*n+1)*fe2*t+phin2[n])
    return val

t = np.linspace(0, 2/fe, 500)  # Affiche la fenêtre temporelle, (ici deux périodes) et le niveau
# de discrétisation (ici 500 points régulièrement espacés).

plt.plot(t, e(t), 'b-', label=r'$e(t)$')

plt.plot(t, e2(t), 'r-', label=r'$e\'(t)$')

plt.xlim(0, 2/fe), plt.xlabel(r"$t$ (en s)")
#plt.ylim(-0.5, 2.5)
plt.ylabel(r"$e(t)$ (en V)")
plt.legend()
plt.grid()
plt.savefig('figentree.jpg')  # Exporte le fichier au format jpg.
plt.show()